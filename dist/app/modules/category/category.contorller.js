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
exports.getSingleCategoryFromDbController = exports.deleteOneCategoryController = exports.updateOneCateogryIntoDBController = exports.getAllCategoriesFromDBController = exports.createCategoryIntoDatabseController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const category_service_1 = require("./category.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const createCategoryIntoDatabseController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield (0, category_service_1.createCategoryIntoDBService)(data);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully Create Category',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
exports.createCategoryIntoDatabseController = createCategoryIntoDatabseController;
const getAllCategoriesFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, category_service_1.getAllCategoryFromDBService)(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully retrived categories',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
exports.getAllCategoriesFromDBController = getAllCategoriesFromDBController;
const getSingleCategoryFromDbController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, category_service_1.getSingleCategoryFromDbService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully retrived category',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
exports.getSingleCategoryFromDbController = getSingleCategoryFromDbController;
const updateOneCateogryIntoDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, category_service_1.updateOneCateogryIntoDBService)(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully update category',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
exports.updateOneCateogryIntoDBController = updateOneCateogryIntoDBController;
// delete category from db controller
const deleteOneCategoryController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, category_service_1.deleCateogryService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully removed category',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
exports.deleteOneCategoryController = deleteOneCategoryController;
