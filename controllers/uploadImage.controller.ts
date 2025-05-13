import { Request, Response } from "express"
import uploadImageCloudinary from "../services/uploadImageCloudinary.js"

const uploadImageController = async(request:Request,response:Response)=>{
    try {
        const files = request.files as Express.Multer.File[]

        if(!files || files.length === 0){
            return response.status(400).json({
                message : "No files provided",
                error : true,
                success : false
            })
        }
        
        // Array to store all upload results
        const uploadResults = []
        
        // Process each file and upload to Cloudinary
        for (const file of files) {
            // Create a File-like object from the Multer file
            const fileFromBuffer = {
                arrayBuffer: async () => file.buffer,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
            } as unknown as File;

            const uploadResult = await uploadImageCloudinary(fileFromBuffer)
            uploadResults.push(uploadResult)
        }

        return response.json({
            message : "All uploads completed successfully",
            data : uploadResults,
            success : true,
            error : false
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error uploading images:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export default uploadImageController