import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;
    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    // console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(file);
    return response;
  } catch (error) {
    console.log("Error on Cloudinary ", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const deleteOnCloudinary = async (id) => {
  try {
    await cloudinary.uploader.destroy(id);
    console.log("Deleted from cloudinary,Public_id: ", public_Id);
  } catch (error) {
    console.log("Error in Deleting in Cloudinary", error);
    return null;
  }
};
export { uploadOnCloudinary, deleteOnCloudinary };
