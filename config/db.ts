import mongoose from "mongoose";
import { dbURL } from "./env.js";


if(!dbURL) {
    throw new Error("Database URL is not defined");
}
const connectDB = async () => {
  try {
    await mongoose.connect(dbURL!);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
export { connectDB, disconnectDB };
export default mongoose;