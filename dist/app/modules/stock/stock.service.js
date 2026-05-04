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
exports.updateSingleStockFromDbService = exports.removedSingleStockFromDBService = exports.getSingleStockFromDBService = exports.getAllStockFromDBService = exports.createStockIntoDBService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const stock_model_1 = __importDefault(require("./stock.model"));
const gsku_1 = __importDefault(require("../../helpers/gsku"));
const warehouse_model_1 = __importDefault(require("../warehouse/warehouse.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// post stok in database
const createStockIntoDBService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // generate sku dynamacilly
    const sku = yield (0, gsku_1.default)(payload.productName);
    if (sku) {
        payload.sku = sku;
    }
    // check warehouse is exists
    const isWarehouseExists = yield warehouse_model_1.default.findOne({
        _id: payload.warehouse,
        isDeleted: { $ne: true },
    });
    if (!isWarehouseExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Warehouse not found!');
    }
    const result = yield stock_model_1.default.create(payload);
    return {
        productName: result.productName,
        sku: result.sku,
        insertedId: result._id,
    };
});
exports.createStockIntoDBService = createStockIntoDBService;
// get all stock
const getAllStockFromDBService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const stockQuery = new QueryBuilder_1.default(stock_model_1.default.find({ isDeleted: { $ne: true } }).populate('warehouse', 'name location capacity _id'), query)
        .search(['productName', 'sku'])
        .filter()
        .fields()
        .paginate();
    const result = yield stockQuery.modelQuery;
    if (result.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No Stock found. Failed to retrieve Stock.');
    }
    const total = yield stock_model_1.default.countDocuments(stockQuery.modelQuery.getFilter());
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
});
exports.getAllStockFromDBService = getAllStockFromDBService;
// get single stock
const getSingleStockFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield stock_model_1.default.findOne({ _id: id, isDeleted: { $ne: true } }, // filter
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 }).populate('warehouse', 'name location capacity');
    // if stock not found
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No Stock found. Failed to retrieve Stock.');
    }
    // if document soft deleted
    if (result.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No Stock found. Failed to retrieve Stock.');
    }
    return result;
});
exports.getSingleStockFromDBService = getSingleStockFromDBService;
// Removed single stock from service
const removedSingleStockFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // check if stock exists in database
    const isExistStockInDB = yield stock_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    // is exist stock in db
    if (!isExistStockInDB) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Stock not found!');
    }
    // soft deleted
    const result = yield stock_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete warehouse');
    }
    return {
        id: result._id,
    };
});
exports.removedSingleStockFromDBService = removedSingleStockFromDBService;
// update single stock from service
const updateSingleStockFromDbService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isStockExistsInDatabase = yield stock_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    // Is stock exists
    if (!isStockExistsInDatabase) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Stock not found!');
    }
    // update stock single
    const result = yield stock_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
        projection: { isDeleted: 0 },
    });
    // Is failed update stock
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'stock not updated');
    }
    return result;
});
exports.updateSingleStockFromDbService = updateSingleStockFromDbService;
