"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiApiKey = exports.cloudinaryUrl = exports.cloudinaryCloudName = exports.cloudinaryApiSecret = exports.cloudinaryApiKey = exports.nodeEnv = exports.jwtExpiration = exports.jwtSecret = exports.frontEndUrl = exports.resendAPIKey = exports.dbURL = exports.port = void 0;
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var envPath = path_1.default.resolve(__dirname, '../../.env');
// console.log('envPath', envPath)
(0, dotenv_1.config)({ path: envPath });
var port = process.env.PORT || 3000;
exports.port = port;
var dbURL = process.env.MONGODB_URI;
exports.dbURL = dbURL;
// Resend API key
var resendAPIKey = process.env.RESEND_API_KEY;
exports.resendAPIKey = resendAPIKey;
var frontEndUrl = process.env.FRONTEND_URL;
exports.frontEndUrl = frontEndUrl;
var jwtSecret = process.env.JWT_SECRET;
exports.jwtSecret = jwtSecret;
var jwtExpiration = process.env.JWT_EXPIRATION;
exports.jwtExpiration = jwtExpiration;
var jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
var jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION;
// Cloudinary
var cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
exports.cloudinaryCloudName = cloudinaryCloudName;
var cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
exports.cloudinaryApiKey = cloudinaryApiKey;
var cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
exports.cloudinaryApiSecret = cloudinaryApiSecret;
var cloudinaryUrl = process.env.CLOUDINARY_URL;
exports.cloudinaryUrl = cloudinaryUrl;
// NODE_ENV 
var nodeEnv = process.env.NODE_ENV || 'development';
exports.nodeEnv = nodeEnv;
// Gemini API
var geminiApiKey = process.env.GEMINI_API_KEY;
exports.geminiApiKey = geminiApiKey;
