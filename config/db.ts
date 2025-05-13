import mongoose from "mongoose";
import { dbURL } from "./env.js";


if(!dbURL) {
    throw new Error("Database URL is not defined");
}

const connection = {
  isConnected: false,
}
const connectDB = async () => {
  try {
    if (connection.isConnected) {
      console.log("MongoDB is already connected");
      return;
    }
    await mongoose.connect(dbURL!);
    connection.isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
const disconnectDB = async () => {
  try {
    if (!connection.isConnected) {
      console.log("MongoDB is not connected");
      return;
    }
    await mongoose.connection.close();
    connection.isConnected = false;
    console.log("MongoDB connection closed");
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
export { connectDB, disconnectDB };
export default mongoose;