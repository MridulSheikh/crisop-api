import httpStatus from 'http-status';
import fs from 'fs';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { IBrand, IBrandImage } from './brand.interface';
import Brand from './brand.model';
import { v2 as cloudinary } from 'cloudinary';

const deleteBrandImageFromCloudinary = async (img?: IBrandImage | string) => {
  const publicId = typeof img === 'string' ? undefined : img?.public_id;

  if (!publicId) {
    return;
  }

  const resCloudinary = await cloudinary.uploader.destroy(publicId);

  if (!['ok', 'not found'].includes(resCloudinary.result)) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'We were unable to delete the image. Please try again.',
    );
  }
};

const createBrandIntoDBService = async (
  payload: IBrand,
  // eslint-disable-next-line no-undef
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please upload brand image!');
  }

  const isBrandExists = await Brand.findOne({
    name: payload.name,
    isDeleted: { $ne: true },
  });

  if (isBrandExists) {
    throw new AppError(httpStatus.CONFLICT, 'Brand already exist!');
  }

  const uploadedImage = await sendImageToCloudinary(file.path, {
    folder: 'brands',
  });

  const result = await Brand.create({
    ...payload,
    img: {
      url: uploadedImage.url,
      public_id: uploadedImage.public_id,
    },
  });

  fs.unlinkSync(file.path);

  return result;
};

const getAllBrandFromDBService = async (query: Record<string, unknown>) => {
  const brandQuery = new QueryBuilder(
    Brand.find({ isDeleted: { $ne: true } }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await brandQuery.modelQuery;

  const total = await Brand.countDocuments(brandQuery.modelQuery.getFilter());

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    data: result,
  };
};

const getSingleBrandFromDBService = async (id: string) => {
  const result = await Brand.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Brand not found!');
  }

  return result;
};

const updateBrandIntoDBService = async (
  id: string,
  payload: Partial<IBrand>,
  // eslint-disable-next-line no-undef
  file?: Express.Multer.File,
) => {
  const brand = await Brand.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!brand) {
    throw new AppError(httpStatus.NOT_FOUND, 'Brand not found!');
  }

  const updateData: Partial<IBrand> = {};

  if (payload.name) {
    updateData.name = payload.name;
  }

  if (file) {
    const uploadedImage = await sendImageToCloudinary(file.path, {
      folder: 'brands',
    });

    updateData.img = {
      url: uploadedImage.url,
      public_id: uploadedImage.public_id,
    };

    fs.unlinkSync(file.path);
    await deleteBrandImageFromCloudinary(brand.img);
  }

  const result = await Brand.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Brand not updated!');
  }

  return result;
};

const softDeleteBrandFromDBService = async (id: string) => {
  const brand = await Brand.findOne({ _id: id, isDeleted: { $ne: true } });

  if (!brand) {
    throw new AppError(httpStatus.NOT_FOUND, 'Brand not found!');
  }

  await deleteBrandImageFromCloudinary(brand.img);

  const result = await Brand.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Brand not found!');
  }

  return result;
};

const hardDeleteBrandFromDBService = async (id: string) => {
  const brand = await Brand.findById(id);

  if (!brand) {
    throw new AppError(httpStatus.NOT_FOUND, 'Brand not found!');
  }

  await deleteBrandImageFromCloudinary(brand.img);

  const result = await Brand.findByIdAndDelete(id);

  return result;
};

export {
  createBrandIntoDBService,
  getAllBrandFromDBService,
  getSingleBrandFromDBService,
  hardDeleteBrandFromDBService,
  softDeleteBrandFromDBService,
  updateBrandIntoDBService,
};
