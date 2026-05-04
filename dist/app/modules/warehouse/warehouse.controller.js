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
exports.getSingleWareHouseByIdFromDBController = exports.deleteWarehouseController = exports.updateWarehouseIntoDbController = exports.getAllWarehouseFromDbController = exports.createWarehouseIntoDbController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const warehouse_service_1 = require("./warehouse.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const createWarehouseIntoDbController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reuslt = yield (0, warehouse_service_1.createWarehouseService)(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully create warehouse',
        data: reuslt,
    });
}));
exports.createWarehouseIntoDbController = createWarehouseIntoDbController;
const getAllWarehouseFromDbController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, warehouse_service_1.getAllWarehouseFromDBService)(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully retrived warehouse',
        data: result,
    });
}));
exports.getAllWarehouseFromDbController = getAllWarehouseFromDbController;
const getSingleWareHouseByIdFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, warehouse_service_1.getSingleWarehoseByIdService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully retrived warehouse",
        data: result
    });
}));
exports.getSingleWareHouseByIdFromDBController = getSingleWareHouseByIdFromDBController;
const updateWarehouseIntoDbController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, warehouse_service_1.updateWarehousebyIdService)(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Successfully updated warehouse',
        data: result,
    });
}));
exports.updateWarehouseIntoDbController = updateWarehouseIntoDbController;
const deleteWarehouseController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, warehouse_service_1.deleteWarehousebyIdService)(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully deleted warehouse",
        data: result._id
    });
}));
exports.deleteWarehouseController = deleteWarehouseController;
