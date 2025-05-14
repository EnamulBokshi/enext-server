import ProductModel from "../models/product.model.js";
import {Response, Request} from "express"
import uploadImageCloudinary from "../services/uploadImageCloudinary.js";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import os from 'os';
import { trackUserActivity } from "../services/userActivity.service.js";

// Helper function to save buffer to temp file
async function saveTempFile(buffer: Buffer, originalname: string): Promise<string> {
  const tempDir = os.tmpdir();
  const filename = `${Date.now()}-${originalname}`;
  const filepath = path.join(tempDir, filename);
  
  const writeFile = promisify(fs.writeFile);
  await writeFile(filepath, buffer);
  
  return filepath;
}

export const createProductController = async(request:Request,response:Response)=>{
    try {
        // With upload.fields(), files are organized by field name
        const fileFields = request.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Collect all files from various possible field names
        let allFiles: Express.Multer.File[] = [];
        if (fileFields) {
            Object.keys(fileFields).forEach(fieldName => {
                allFiles = [...allFiles, ...fileFields[fieldName]];
            });
        }
        
        if (!allFiles || allFiles.length === 0) {
            return response.status(400).json({
                message: "Product images are required",
                error: true,
                success: false
            });
        }
        
        const { 
            title,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!title || !category || !subCategory || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        // Upload each image to Cloudinary
        const imagePromises = allFiles.map(async (file) => {
            // Save buffer to temporary file and pass file path to Cloudinary
            const tempFilePath = await saveTempFile(file.buffer, file.originalname);
            
            try {
                // Use the native File interface of the uploadImageCloudinary service
                const uploadResult = await uploadImageCloudinary({
                    path: tempFilePath,
                    mimetype: file.mimetype,
                    originalname: file.originalname
                });
                
                // Clean up temp file after upload
                fs.unlink(tempFilePath, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
                
                return uploadResult.secure_url;
            } catch (error) {
                // Clean up temp file in case of error
                fs.unlink(tempFilePath, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
                throw error;
            }
        });
        
        // Wait for all image uploads to complete
        const imageUrls = await Promise.all(imagePromises);

        // Parse JSON strings if they're sent as form data strings
        const parsedCategory = typeof category === 'string' ? JSON.parse(category) : category;
        const parsedSubCategory = typeof subCategory === 'string' ? JSON.parse(subCategory) : subCategory;

        const slug = title.replace(/\s+/g, '-').toLowerCase(); // Generate slug from title
        // Check if the slug already exists
        const existingProduct = await ProductModel.findOne({ slug });
        if (existingProduct) {
            return response.status(400).json({
                message: "Product with this slug already exists",
                error: true,
                success: false
            });
        }

        // Create new product with correct field names
        const product = new ProductModel({
            title,
            slug,
            images: imageUrls, // Use Cloudinary URLs for images
            category: parsedCategory,
            sub_category: parsedSubCategory,
            unit,
            currentStock: stock,
            price,
            discount,
            description,
            more_details,
        })
        
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getProductController = async(request:Request,response:Response)=>{
    try {
        // Get parameters from request.query
        let { page, limit, search } = request.query 
        console.log("getProctuctController", request.query);
        // Set default values and ensure correct types
        const pageNum = page ? Number(page) : 1
        const limitNum = limit ? Number(limit) : 10
        
        // Define query with proper typing
        const query: Record<string, any> = search ? {
            $text : {
                $search : search as string
            }
        } : {}

        const skip = (pageNum - 1) * limitNum

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limitNum).populate('category sub_category'),
            ProductModel.countDocuments(query)
        ])

        // Track user activity if user is logged in and search query exists
        if (request.userId && search) {
            trackUserActivity(request, 'search', {
                searchQuery: search,
                page: 'products_search'
            });
        }

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil(totalCount / limitNum),
            data : data
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error fetching products:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request:Request,response:Response)=>{
    try {
        const { id } = request.query 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in : id }
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
            error : false,
            success : true
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory = async(request:Request,response:Response)=>{
    try {
        let { categoryId, subCategoryId, page, limit } = request.query

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        const pageNum = page ? Number(page) : 1
        const limitNum = limit ? Number(limit) : 10

        const query = {
            category : { $in : categoryId },
            subCategory : { $in : subCategoryId }
        }

        const skip = (pageNum - 1) * limitNum

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limitNum),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : pageNum,
            limit : limitNum,
            success : true,
            error : false
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request:Request,response:Response)=>{
    try {
        const { productId } = request.query 
        console.log("getProductDetails", request.query);
        if(!productId){
            return response.status(400).json({
                message : "provide product id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findOne({ _id : productId })

        // Track product view activity if user is logged in
        if (request.userId) {
            trackUserActivity(request, 'product_view', {
                productId,
                page: 'product_details'
            });
        }

        return response.json({
            message : "product details",
            data : product,
            error : false,
            success : true
        })

    }catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

//update product
export const updateProductDetails = async(request:Request,response:Response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }
        
        // With upload.fields(), files are organized by field name
        const fileFields = request.files as { [fieldname: string]: Express.Multer.File[] };
        let updateData = {...request.body};
        let allFiles: Express.Multer.File[] = [];
        
        // Collect all files from various possible field names
        if (fileFields) {
            Object.keys(fileFields).forEach(fieldName => {
                allFiles = [...allFiles, ...fileFields[fieldName]];
            });
        }
        
        // If new images were uploaded, process them
        if(allFiles && allFiles.length > 0) {
            // Upload each image to Cloudinary
            const imagePromises = allFiles.map(async (file) => {
                // Save buffer to temporary file and pass file path to Cloudinary
                const tempFilePath = await saveTempFile(file.buffer, file.originalname);
                
                try {
                    // Use the native File interface of the uploadImageCloudinary service
                    const uploadResult = await uploadImageCloudinary({
                        path: tempFilePath,
                        mimetype: file.mimetype,
                        originalname: file.originalname
                    });
                    
                    // Clean up temp file after upload
                    fs.unlink(tempFilePath, (err) => {
                        if (err) console.error("Error deleting temp file:", err);
                    });
                    
                    return uploadResult.secure_url;
                } catch (error) {
                    // Clean up temp file in case of error
                    fs.unlink(tempFilePath, (err) => {
                        if (err) console.error("Error deleting temp file:", err);
                    });
                    throw error;
                }
            });
            
            // Wait for all image uploads to complete
            const imageUrls = await Promise.all(imagePromises);
            
            // Update with the correct field name
            updateData.images = imageUrls;
            
            // Remove old image field if it exists (to avoid conflicts)
            if (updateData.image) {
                delete updateData.image;
            }
        }
        
        // Parse JSON strings if they're sent as form data strings
        if(typeof updateData.category === 'string') {
            updateData.category = JSON.parse(updateData.category);
        }
        
        if(typeof updateData.subCategory === 'string') {
            updateData.sub_category = JSON.parse(updateData.subCategory);
            delete updateData.subCategory;
        }

        const updateProduct = await ProductModel.updateOne({ _id }, updateData);

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error updating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

//delete product
export const deleteProductDetails = async(request:Request,response:Response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    }catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request:Request,response:Response)=>{
    try {
        let { search, page, limit, categoryId, subCategoryId } = request.query 

        const pageNum = page ? Number(page) : 1
        const limitNum = limit ? Number(limit) : 10

        // Build a more flexible query
        let query: Record<string, any> = {};
        
        // If search term is provided, use text search
        if (search) {
            query.$text = { $search: search as string };
        }
        
        // Filter by category if provided
        if (categoryId) {
            query.category = { $in: Array.isArray(categoryId) ? categoryId : [categoryId] };
        }
        
        // Filter by sub-category if provided
        if (subCategoryId) {
            query.sub_category = { $in: Array.isArray(subCategoryId) ? subCategoryId : [subCategoryId] };
        }

        const skip = (pageNum - 1) * limitNum

        // Check if we need to sort by text score when using text search
        const sortOptions: Record<string, any> = search 
            ? { score: { $meta: 'textScore' } } 
            : { createdAt: -1 };

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate('category sub_category'),
            ProductModel.countDocuments(query)
        ])

        // Track user activity if user is logged in and search query exists
        if (request.userId && search) {
            trackUserActivity(request, 'search', {
                searchQuery: search,
                categoryId,
                subCategoryId,
                page: 'products_search'
            });
        }

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount: dataCount,
            totalPage : Math.ceil(dataCount/limitNum),
            page : pageNum,
            limit : limitNum 
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error searching products:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

// get product by slug
export const getProductBySlug = async(request:Request,response:Response)=>{
    try {
        const { slug } = request.query
        console.log("getProductBySlug", request.query); 

        if(!slug){
            return response.status(400).json({
                message : "provide slug",
                error : true,
                success : false
            })
        }

        console.log("slug: ", slug);
        const product = await ProductModel.findOne({ slug : slug })

        return response.json({
            message : "product details",
            data : product,
            error : false,
            success : true
        })

    }catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating product:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}