import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
import { nodeEnv, port } from "./config/env.js";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import uploadRouter from "./routes/upload.route.js";
import subCategoryRouter from "./routes/subCategory.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import addressRouter from "./routes/address.route.js";
import orderRouter from "./routes/order.route.js";
import preferenceRouter from "./routes/userPreference.route.js";
import productPerformanceRouter from "./routes/productPerformance.route.js";
import productAnalysisRouter from "./routes/productAnalysis.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import inventoryAssistRouter from "./routes/inventoryAssist.route.js";
import productRatingRouter from "./routes/productRating.route.js";
import { activityTrackingMiddleware } from "./middleware/activity.middleware.js";
import { performanceMiddleware } from "./middleware/performance.middleware.js";
import { inventoryAlertMiddleware } from "./middleware/inventory.middleware.js";
import assistRouter from "./routes/assist.route.js";
import { initializeScheduledJobs, stopScheduledJobs } from "./services/smartInventory/scheduler.js";
import { getInventoryController } from "./services/inventory.service.js";

// Database connection
connectDB().catch(err => {
    console.error('Failed to connect to database:', err);
});

const app = express();

// Enhanced CORS configuration for better Postman compatibility
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'Origin', 'Accept'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Preflight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy: false,
}))

// Apply activity tracking middleware after parsing and before routes
app.use(activityTrackingMiddleware);
// Apply performance tracking middleware
app.use(performanceMiddleware);
// Apply inventory alert middleware
app.use(inventoryAlertMiddleware);

app.get('/', (req, res) => {
    res.send('Welcome to the Smart Inventory Management System API');
})

// User routes
app.use('/api/v1/users',userRouter)
app.use("/api/v1/categories",categoryRouter)
app.use("/api/v1/file",uploadRouter)
app.use("/api/v1/subcategories",subCategoryRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/carts",cartRouter)
app.use("/api/v1/address",addressRouter)
app.use('/api/v1/orders',orderRouter)
// User preferences and activity routes
app.use('/api/v1/preferences', preferenceRouter)
// Product performance routes
app.use('/api/v1/product-performance', productPerformanceRouter)
// Product photo analysis routes
app.use('/api/v1/product-analysis', productAnalysisRouter)
// Inventory management routes
app.use('/api/v1/inventory', inventoryRouter)
// Inventory AI assistant routes
app.use('/api/v1/inventory-assist', inventoryAssistRouter)
// Product rating routes
app.use('/api/v1/ratings', productRatingRouter)
// AI routes
app.use('/api/v1/assist',assistRouter)

app.use("/api/v1/inventory/public", getInventoryController);

// Start the server only in development mode, not in Vercel production
if (nodeEnv !== 'production') {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`http://localhost:${port}`);
        
        // Initialize smart inventory scheduled jobs
        initializeScheduledJobs();
        console.log('Smart inventory management system initialized');
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        stopScheduledJobs();
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
    
    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        stopScheduledJobs();
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
} else {
    // For production environments, initialize jobs when the module is imported
    // This ensures scheduled jobs run in serverless environments too
    initializeScheduledJobs();
    console.log('Smart inventory management system initialized in production mode');
}

// Export the Express app for Vercel serverless functions
export default app;
