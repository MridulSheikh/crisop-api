import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IProductInterface } from './product.interface';
import Product from './product.model';
import Stock from '../stock/stock.model';
import Category from '../category/category.model';
import { Types } from 'mongoose';

// Create new product
const createProductIntoDBService = async (payload: IProductInterface) => {
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
  if (payload.discountPrice && payload.discountPrice >= payload.price) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Discount price must be less than regular price'
    );
  }

  const result = await Product.create({
    ...payload,
    isFeatured: payload.isFeatured || false,
    isDeleted: false,
    isPublished: payload.isPublished || false,
  });

  return {
    productName: result.name,
    insertedId: result._id,
  };
};

// Get all products (with filters)
const getAllProductsFromDBService = async ({
  limit = 10,
  page = 1,
  category,
  minPrice,
  maxPrice,
  featuredOnly = false,
}: {
  limit?: number;
  page?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { isDeleted: { $ne: true } };

  if (featuredOnly) query.isFeatured = true;
  if (category && Types.ObjectId.isValid(category)) query.category = category;

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const results = await Product.find(query, {
    isDeleted: 0,
    __v: 0,
  })
    .populate('stock', 'quantity warehouse')
    .populate('category', 'name')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (results.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No products found');
  }

  return results;
};

// Get single product by ID
const getSingleProductFromDBService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const result = await Product.findOne(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: 0, __v: 0 }
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
  payload: IProductInterface
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
        'Discount price must be less than regular price'
      );
    }
  }

  const result = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    projection: { isDeleted: 0, __v: 0 },
  }).populate('category', 'name');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found or update failed');
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
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found or delete failed');
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