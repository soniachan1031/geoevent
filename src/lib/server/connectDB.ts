import mongoose from "mongoose";
import { MONGO_URI } from "../credentials";

/**
 * Connects to the MongoDB database
 *
 * @return {Promise<void>} A promise that resolves when the connection is established, or rejects with an error if the connection fails.
 */
const connectDB = async (): Promise<any> => {
  try {
    // check mongo uri
    if (!MONGO_URI) {
      throw new Error("Mongo URI not found");
    }

    // Check if the connection is already established
    if (mongoose.connections[0].readyState) {
      return mongoose.connections[0];
    }

    if (process.env.NODE_ENV === "development") {
      return mongoose.connect(MONGO_URI, {
        bufferCommands: false, // Disable command buffering in development
      });
    } else {
      // Consider using a connection pool for production (optional)
      return mongoose.connect(MONGO_URI);
    }
  } catch (error) {
    console.error("error connecting to databse", error);
    throw error;
  }
};

export default connectDB;
