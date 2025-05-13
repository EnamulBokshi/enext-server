import SubCategoryModel from "../models/subCategory.model.js";
import { Response, Request } from "express";

export const AddSubCategoryController = async(request:Request,response:Response)=>{
    try {
        const { name, image, category, slug,description} = request.body 

        if(!name && !image && !category[0] && !slug){
            return response.status(400).json({
                message : "Provide name, image, category",
                error : true,
                success : false
            })
        }
        const payload = {
            name,
            image,
            category,
            slug,
            description: description || "",
        }

        const createSubCategory = new SubCategoryModel(payload)
        const save = await createSubCategory.save()

        return response.json({
            message : "Sub Category Created",
            data : save,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating sub category:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getSubCategoryController = async(request:Request,response:Response)=>{
    try {
        const data = await SubCategoryModel.find().sort({createdAt : -1}).populate('category')
        return response.json({
            message : "Sub Category data",
            data : data,
            error : false,
            success : true
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error fetching sub category:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const updateSubCategoryController = async(request:Request,response:Response)=>{
    try {
        const { _id, name, image,category, slug, description } = request.body 

        const checkSub = await SubCategoryModel.findById(_id)

        if(!checkSub){
            return response.status(400).json({
                message : "Check your _id",
                error : true,
                success : false
            })
        }

        const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(_id,{
            name,
            image,
            category,
            slug,
            description: description || "",
        })

        return response.json({
            message : 'Updated Successfully',
            data : updateSubCategory,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error updating sub category:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const deleteSubCategoryController = async(request:Request,response:Response)=>{
    try {
        const { _id } = request.body 
        console.log("Id",_id)
        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id)

        return response.json({
            message : "Delete successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error deleting sub category:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}