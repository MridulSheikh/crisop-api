import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME as string,
  api_key: config.CLOUDINARY_API_KEY as string,
  api_secret: config.CLOUDINARY_API_SECRET as string,
});

type TUploadOptions = {
  folder?: string;
  public_id?: string;
};

export const sendImageToCloudinary = async (
  filePath: string,
  options?: TUploadOptions
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options?.folder || "uploads",
      public_id: options?.public_id,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new AppError(httpStatus.BAD_REQUEST,"Image upload failed");
  }
};