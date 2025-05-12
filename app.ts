import express from "express";
import cors from 'cors'

import cookieParser from "cookie-parser";

import { port } from "./config/env.js";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";

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


app.get('/', (req, res) => {
    res.send('Hello World!')
})


// User routes
app.use('/api/v1/users',userRouter)


connectDB().then(() =>{
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`http://localhost:${port}`);
    });
})
