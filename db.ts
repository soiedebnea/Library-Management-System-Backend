import mongoose from "mongoose";

/**
 * Establishes connection to MongoDB using the URI supplied in .env
 * Exits the process if the connection cannot be established, since
 * the API is useless without a working database.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/library_management";

  try {
    await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB -> ${mongoose.connection.name}`);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });
}

export default mongoose;