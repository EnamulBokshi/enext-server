import { v2 as cloudinary } from "cloudinary";
import { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } from '../config/env.js';
import fs from 'fs';

// Define types for file input
interface FileInput {
  path: string;
  mimetype: string;
  originalname: string;
}

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  // Add other properties that Cloudinary returns as needed
}

const uploadImageCloudinary = async(fileInput: FileInput | File): Promise<CloudinaryResponse> => {
    try {
        if(!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
            console.error("Cloudinary credentials are not defined");
            throw new Error("Cloudinary credentials are not defined");
        }
        
        cloudinary.config({
            cloud_name: cloudinaryCloudName,
            api_key: cloudinaryApiKey,
            api_secret: cloudinaryApiSecret,
        });
        
        // Handle the file based on its type
        if ('path' in fileInput) {
            // Node.js file path approach
            return new Promise<CloudinaryResponse>((resolve, reject) => {
                cloudinary.uploader.upload(
                    fileInput.path,
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
            });
        } else {
            // Browser File object approach (kept for compatibility)
            const buffer = Buffer.from(await fileInput.arrayBuffer());
            
            return new Promise<CloudinaryResponse>((resolve, reject) => {
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
        }
        
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw new Error("Error uploading image to Cloudinary");
    }
}

export default uploadImageCloudinary;