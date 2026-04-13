import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IProductInterface } from './product.interface';
import Product from './product.model';
import Stock from '../stock/stock.model';
import Category from '../category/category.model';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendImageToCloudinary } from '../../utils/SendImageToCloudinary';
import fs from 'fs'


// Create new product
const createProductIntoDBService = async (
  payload: IProductInterface,
  // eslint-disable-next-line no-undef
  files: Express.Multer.File[],
) => {
  // Image reauired validation
  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please Upload Product Image!');
  }
  // Validate references exist
  const [stockExists, categoryExists] = await Promise.all([
    Stock.findOne({ _id: payload.stock, isDeleted: { $ne: true } }),
    Category.findOne({ _id: payload.category, isDeleted: { $ne: true } }),
  ]);

  if (!stockExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Referenced stock not found');
  }

  if (!categoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Referenced category not found');
  }

  // Validate discount price
  if (payload.discountPrice && payload.discountPrice < payload.price) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Discount Price!');
  }

   // ☁️ Upload images to cloudinary
  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const result = await sendImageToCloudinary(file.path, {
        folder: "products",
      });
      return result.url;
    })
  );

  const result = await Product.create({
    ...payload,
    images: uploadedImages,
    isFeatured: payload.isFeatured || false,
    isDeleted: false,
    isPublished: payload.isPublished || false,
  });

  //  delete local files
  files.forEach((file) => fs.unlinkSync(file.path));

  return {
    productName: result,
    insertedId: result._id,
  };
};

// Get all products (with filters)
const getAllProductsFromDBService = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: { $ne: true } })
      .populate('stock', 'quantity warehouse')
      .populate('category', 'name'),
    query,
  )
    .search(['name', 'description'])
    .filter()
    .fields()
    .sort()
    .paginate();

  const result = await productQuery.modelQuery;

  const total = await Product.countDocuments(
    productQuery.modelQuery.getFilter(),
  );

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

// Get single product by ID
const getSingleProductFromDBService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const result = await Product.findOne(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: 0, __v: 0 },
  )
    .populate('stock', 'quantity warehouse')
    .populate('category', 'name');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

// Update product by ID
const updateSingleProductInDBService = async (
  id: string,
  payload: IProductInterface,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  // Prevent updating certain fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { isDeleted, ...updateData } = payload;

  // Validate references if being updated
  if (updateData.stock) {
    const stockExists = await Stock.findOne({
      _id: updateData.stock,
      isDeleted: { $ne: true },
    });
    if (!stockExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced stock not found');
    }
  }

  if (updateData.category) {
    const categoryExists = await Category.findOne({
      _id: updateData.category,
      isDeleted: { $ne: true },
    });
    if (!categoryExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced category not found');
    }
  }

  // Validate discount price
  if (updateData.discountPrice) {
    const currentProduct = await Product.findById(id);
    if (
      updateData.discountPrice >=
      (updateData.price ?? currentProduct?.price ?? 0)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Discount price must be less than regular price',
      );
    }
  }

  const result = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    projection: { isDeleted: 0, __v: 0 },
  }).populate('category', 'name');

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Product not found or update failed',
    );
  }

  return result;
};

// Soft delete product
const removeSingleProductFromDBService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true, isPublished: false },
    { new: true },
  );

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Product not found or delete failed',
    );
  }

  return {
    id: result._id,
    name: result.name,
    status: 'Soft deleted successfully',
  };
};

// Toggle featured status
const toggleFeaturedStatusService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const product = await Product.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  return {
    id: product._id,
    name: product.name,
    isFeatured: product.isFeatured,
  };
};

export {
  createProductIntoDBService,
  getAllProductsFromDBService,
  getSingleProductFromDBService,
  updateSingleProductInDBService,
  removeSingleProductFromDBService,
  toggleFeaturedStatusService,
};
