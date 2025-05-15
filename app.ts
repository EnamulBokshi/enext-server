import express from "express";
import cors from 'cors'

import cookieParser from "cookie-parser";

import { port } from "./config/env.js";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import uploadRouter from "./routes/upload.rout.js";
import subCategoryRouter from "./routes/subCategory.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import addressRouter from "./routes/address.route.js";
import orderRouter from "./routes/order.route.js";
import preferenceRouter from "./routes/userPreference.route.js";
import productPerformanceRouter from "./routes/productPerformance.route.js";
import productAnalysisRouter from "./routes/productAnalysis.route.js";
import { activityTrackingMiddleware } from "./middleware/activity.middleware.js";
import { performanceMiddleware } from "./middleware/performance.middleware.js";
import assistRouter from "./routes/assist.route.js";
import seedDatabase from "./scripts/seedCategoriesAndSubcategories.js";

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization','X-API-KEY'],
}));
app.use(express.json());
app.use(cookieParser())
app.use(morgan('dev'))
app.use (helmet({
    crossOriginResourcePolicy: false,
}))

// Apply activity tracking middleware after parsing and before routes
app.use(activityTrackingMiddleware);
// Apply performance tracking middleware
app.use(performanceMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World!')
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

// AI routes
app.use('/api/v1/assist',assistRouter )
connectDB().then(() =>{
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`http://localhost:${port}`);
    });
})
