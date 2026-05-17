import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IProductInterface, TSearchOptions } from './product.interface';
import Product from './product.model';
import Stock from '../stock/stock.model';
import Category from '../category/category.model';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import fs from 'fs';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { v2 as cloudinary } from 'cloudinary';
import Brand from '../brand/brand.model';
import { parseIds } from '../../helpers/parseIds';

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
  const [stockExists, categoryExists, brandExists] = await Promise.all([
    Stock.findOne({ _id: payload.stock, isDeleted: { $ne: true } }),
    Category.findOne({ _id: payload.category, isDeleted: { $ne: true } }),
    Brand.findOne({ _id: payload.brand, isDeleted: { $ne: true } }),
  ]);

  if (!stockExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Referenced stock not found');
  }

  if (!categoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Referenced category not found');
  }

  if (!brandExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Referenced brand not found');
  }

  // Validate discount price
  if (payload.discountPrice && payload.discountPrice > payload.price) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Discount Price!');
  }

  // ☁️ Upload images to cloudinary
  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const result = await sendImageToCloudinary(file.path, {
        folder: 'products',
      });
      return {
        url: result.url,
        public_id: result.public_id,
      };
    }),
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
    body: result,
    insertedId: result._id,
  };
};

// Get all products (with filters)
const getAllProductsFromDBService = async (
  query: Record<string, unknown>,
  options?: { onlyPublished?: boolean },
) => {
  const baseFilter: any = {
    isDeleted: { $ne: true },
  };

  // Apply condition dynamically
  if (options?.onlyPublished) {
    baseFilter.isPublished = { $ne: false };
  }

  const productQuery = new QueryBuilder(
    Product.find(baseFilter)
      .populate({
        path: 'stock',
        select: 'quantity warehouse unit productName',
        populate: {
          path: 'warehouse',
          select: 'name location',
        },
      })
      .populate('category', 'name')
      .populate('brand'),
    query,
  )
    .search(['name', 'description', 'tags'])
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
    .populate('stock', 'quantity warehouse unit')
    .populate('category', 'name')
    .populate('brand');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

const updateSingleProductInDBService = async (
  id: string,
  payload: IProductInterface & {
    removedImages?: Array<string | { public_id: string }>;
  },
  // eslint-disable-next-line no-undef
  files?: Express.Multer.File[],
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { isDeleted, removedImages, ...updateData } = payload;

  const imageIdsToRemove = (removedImages ?? [])
    .map((image) =>
      typeof image === 'string'
        ? JSON.parse(image)?.public_id
        : image?.public_id,
    )
    .filter(Boolean) as string[];

  // STOCK VALIDATION
  if (updateData.stock) {
    const stockExists = await Stock.findOne({
      _id: updateData.stock,
      isDeleted: { $ne: true },
    });

    if (!stockExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced stock not found');
    }
  }

  // CATEGORY VALIDATION
  if (updateData.category) {
    const categoryExists = await Category.findOne({
      _id: updateData.category,
      isDeleted: { $ne: true },
    });

    if (!categoryExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced category not found');
    }
  }

  // Brand Validation
  if (updateData.brand) {
    const brandExists = await Brand.findOne({
      _id: updateData.brand,
      isDeleted: { $ne: true },
    });

    if (!brandExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced Brand not found');
    }
  }

  // DISCOUNT VALIDATION
  if (updateData.discountPrice) {
    const basePrice = updateData.price ?? product.price;

    if (updateData.discountPrice > basePrice) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Discount price must be less than price',
      );
    }
  }

  // REMOVE OLD IMAGES (Cloudinary)
  if (imageIdsToRemove.length) {
    await Promise.all(
      imageIdsToRemove?.map(async (public_id) => {
        const resCloudinary = await cloudinary.uploader.destroy(public_id);
        if (resCloudinary.result != 'ok') {
          throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            'We were unable to delete the image. Please try again.',
          );
        }
      }),
    );

    product.images = product.images?.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (img: any) => !imageIdsToRemove.includes(img.public_id),
    );
  }

  // UPLOAD NEW IMAGES
  if (files?.length) {
    const uploadedImages = await Promise.all(
      files?.map(async (file) => {
        const result = await sendImageToCloudinary(file.path, {
          folder: 'products',
        });

        fs.unlinkSync(file.path);

        return {
          url: result.url,
          public_id: result.public_id,
        };
      }),
    );

    product.images.push(...uploadedImages);
  }

  // UPDATE OTHER FIELDS
  Object.assign(product, updateData);

  const updated = await product.save();

  return updated;
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

const atlasProductSearchService = async (
  query: string,
  options?: TSearchOptions,
) => {
  const searchTerm = typeof query === 'string' ? query.trim() : '';

  // pagination
  const page = Math.max(1, Number(options?.page) || 1);
  const limit = Math.max(1, Number(options?.limit) || 10);
  const skip = (page - 1) * limit;

  const brandIds = parseIds(options?.brand);
  const categoryIds = parseIds(options?.category);

  const minPrice = Number(options?.minPrice);
  const maxPrice = Number(options?.maxPrice);

  const pipeline: any[] = [];

  // ======================
  // 🔍 SEARCH STAGE
  // ======================
  if (searchTerm) {
    pipeline.push({
      $search: {
        index: 'product_search_index',
        text: {
          query: searchTerm,
          path: ['name', 'description', 'tags'],
          fuzzy: { maxEdits: 1 },
        },
      },
    });
  }

  // ======================
  // 📦 LOOKUP (populate)
  // ======================
  pipeline.push(
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand',
      },
    },
    {
      $unwind: {
        path: '$brand',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  // ======================
  // 🎯 FILTER STAGE
  // ======================
  const matchStage: any = {
    isDeleted: { $ne: true },
  };

  if (brandIds.length) {
    matchStage['brand._id'] = { $in: brandIds };
  }

  if (categoryIds.length) {
    matchStage['category._id'] = { $in: categoryIds };
  }

  // price filter
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    matchStage.price = {};

    if (!isNaN(minPrice)) {
      matchStage.price.$gte = minPrice;
    }

    if (!isNaN(maxPrice)) {
      matchStage.price.$lte = maxPrice;
    }
  }

  pipeline.push({
    $match: matchStage,
  });


  // ======================
  // 📊 RANKING
  // ======================
  if (searchTerm) {
    pipeline.push({
      $addFields: {
        score: { $meta: 'searchScore' },
      },
    });

    pipeline.push({
      $sort: {
        score: -1,
        createdAt: -1,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  // ======================
  // 📄 PAGINATION
  // ======================
  pipeline.push({ $skip: skip }, { $limit: limit });

  // ======================
  // 🚀 DATA
  // ======================

  const data = await Product.aggregate(pipeline);

  // ======================
  // 📊 TOTAL COUNT
  // ======================
  const countPipeline: any[] = [];

  if (searchTerm) {
    countPipeline.push({
      $search: {
        index: 'product_search_index',
        text: {
          query: searchTerm,
          path: ['name', 'description', 'tags'],
          fuzzy: { maxEdits: 1 },
        },
      },
    });
  }

  countPipeline.push(
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand',
      },
    },
    {
      $unwind: {
        path: '$brand',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        isDeleted: { $ne: true },
        ...(brandIds.length && { brand: { $in: brandIds } }),
        ...(categoryIds.length && { category: { $in: categoryIds } }),
      },
    },
    {
      $count: 'total',
    },
  );

  const totalAgg = await Product.aggregate(countPipeline);

  const total = totalAgg[0]?.total || 0;

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

export {
  createProductIntoDBService,
  getAllProductsFromDBService,
  getSingleProductFromDBService,
  updateSingleProductInDBService,
  removeSingleProductFromDBService,
  toggleFeaturedStatusService,
  atlasProductSearchService,
};
