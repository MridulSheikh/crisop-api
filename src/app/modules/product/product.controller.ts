import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import {
  createProductIntoDBService,
  getAllProductsFromDBService,
  getSingleProductFromDBService,
  updateSingleProductInDBService,
  removeSingleProductFromDBService,
  toggleFeaturedStatusService,
} from "./product.service";

// Create new product
const createProductController = catchAsync(async (req: Request, res: Response) => {
  const result = await createProductIntoDBService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: {
      name: result.productName,
      id: result.insertedId,
    },
  });
});

// Get all products (with filters)
const getAllProductsController = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllProductsFromDBService({
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
    category: req.query.category as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    featuredOnly: req.query.featured === 'true',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      total: result.length,
    },
    data: result,
  });
});

// Get single product
const getSingleProductController = catchAsync(async (req: Request, res: Response) => {
  const result = await getSingleProductFromDBService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// Update product
const updateProductController = catchAsync(async (req: Request, res: Response) => {
  const result = await updateSingleProductInDBService(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

// Soft delete product
const deleteProductController = catchAsync(async (req: Request, res: Response) => {
  const result = await removeSingleProductFromDBService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: {
      id: result.id,
      name: result.name,
    },
  });
});

// Toggle featured status
const toggleFeaturedController = catchAsync(async (req: Request, res: Response) => {
  const result = await toggleFeaturedStatusService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product ${result.isFeatured ? 'marked' : 'unmarked'} as featured`,
    data: {
      id: result.id,
      name: result.name,
      isFeatured: result.isFeatured,
    },
  });
});

export {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  toggleFeaturedController,
};