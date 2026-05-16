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
exports.updateBrandIntoDBController = exports.softDeleteBrandFromDBController = exports.hardDeleteBrandFromDBController = exports.getSingleBrandFromDBController = exports.getAllBrandFromDBController = exports.createBrandIntoDBController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const brand_service_1 = require("./brand.service");
const createBrandIntoDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.createBrandIntoDBService)(req.body, 
    // eslint-disable-next-line no-undef
    req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully created brand',
        data: result,
    });
}));
exports.createBrandIntoDBController = createBrandIntoDBController;
const getAllBrandFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.getAllBrandFromDBService)(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully retrived brands',
        data: result,
    });
}));
exports.getAllBrandFromDBController = getAllBrandFromDBController;
const getSingleBrandFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.getSingleBrandFromDBService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully retrived brand',
        data: result,
    });
}));
exports.getSingleBrandFromDBController = getSingleBrandFromDBController;
const updateBrandIntoDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.updateBrandIntoDBService)(req.params.id, req.body, 
    // eslint-disable-next-line no-undef
    req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully updated brand',
        data: result,
    });
}));
exports.updateBrandIntoDBController = updateBrandIntoDBController;
const softDeleteBrandFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.softDeleteBrandFromDBService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully soft deleted brand',
        data: result,
    });
}));
exports.softDeleteBrandFromDBController = softDeleteBrandFromDBController;
const hardDeleteBrandFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, brand_service_1.hardDeleteBrandFromDBService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully hard deleted brand',
        data: result,
    });
}));
exports.hardDeleteBrandFromDBController = hardDeleteBrandFromDBController;
