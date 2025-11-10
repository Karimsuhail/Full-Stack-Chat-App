import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Check if environment variables are loaded
console.log("Cloudinary Config Check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Present" : "❌ Missing",
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Present" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing"
});

if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables. Please check your .env file");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;