
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } from '../config/env.js';

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  // Add other properties that Cloudinary returns as needed
}

const uploadImageCloudinary = async(image: File): Promise<CloudinaryResponse> => {
    try {
        
        if(!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
            console.error("Cloudinary credentials are not defined");
            throw new Error("Cloudinary credentials are not defined");
        }
        const buffer =  Buffer.from(await image.arrayBuffer());
        cloudinary.config({
            cloud_name: cloudinaryCloudName,
            api_key: cloudinaryApiKey,
            api_secret: cloudinaryApiSecret,
        });
       
        const uploadImage = await new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "enext" },
                (error, result) => {
                    if (error) {
                        console.error("Error uploading image to Cloudinary:", error);
                        reject(error);
                    } else {
                        resolve(result as CloudinaryResponse);
                    }
                }
            );
            
            // Write the buffer to the upload stream
            uploadStream.end(buffer);
        });
   
        return uploadImage;
       
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw new Error("Error uploading image to Cloudinary");
    }
}

export default uploadImageCloudinary;