"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsAdminController = exports.toggleFeaturedController = exports.deleteProductController = exports.updateProductController = exports.getSingleProductController = exports.getAllProductsController = exports.createProductController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const product_service_1 = require("./product.service");
// Create new product
const createProductController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.createProductIntoDBService)(req.body, 
    // eslint-disable-next-line no-undef
    req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
}));
exports.createProductController = createProductController;
// Get all products (for all user)
const getAllProductsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.atlasProductSearchService)(req.query.searchTerm, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Products retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
exports.getAllProductsController = getAllProductsController;
const getAllProductsAdminController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.getAllProductsFromDBService)(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Products retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
exports.getAllProductsAdminController = getAllProductsAdminController;
// Get single product
const getSingleProductController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.getSingleProductFromDBService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product retrieved successfully',
        data: result,
    });
}));
exports.getSingleProductController = getSingleProductController;
// Update product
const updateProductController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.updateSingleProductInDBService)(req.params.id, req.body, 
    // eslint-disable-next-line no-undef
    req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
}));
exports.updateProductController = updateProductController;
// Soft delete product
const deleteProductController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.removeSingleProductFromDBService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product deleted successfully',
        data: {
            id: result.id,
            name: result.name,
        },
    });
}));
exports.deleteProductController = deleteProductController;
// Toggle featured status
const toggleFeaturedController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, product_service_1.toggleFeaturedStatusService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Product ${result.isFeatured ? 'marked' : 'unmarked'} as featured`,
        data: {
            id: result.id,
            name: result.name,
            isFeatured: result.isFeatured,
        },
    });
}));
exports.toggleFeaturedController = toggleFeaturedController;
