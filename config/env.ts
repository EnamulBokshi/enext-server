import  {config}from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '../../.env')

// console.log('envPath', envPath)
config({path: envPath})

const port = process.env.PORT || 3000
const dbURL = process.env.MONGODB_URI

// Resend API key
const resendAPIKey = process.env.RESEND_API_KEY
const frontEndUrl = process.env.FRONTEND_URL

const jwtSecret = process.env.JWT_SECRET
const jwtExpiration = process.env.JWT_EXPIRATION
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION

// Cloudinary
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryUrl = process.env.CLOUDINARY_URL

// NODE_ENV 
const nodeEnv = process.env.NODE_ENV || 'development'
export {
    port,
    dbURL,
    resendAPIKey,
    frontEndUrl,
    jwtSecret,
    jwtExpiration,
    nodeEnv,
    cloudinaryApiKey,
    cloudinaryApiSecret,
    cloudinaryCloudName,
    cloudinaryUrl,
}

