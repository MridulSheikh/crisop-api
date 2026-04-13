import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import multer from "multer";

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd()+'/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage })