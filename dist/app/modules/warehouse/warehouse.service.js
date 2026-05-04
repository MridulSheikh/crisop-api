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
exports.deleteWarehousebyIdService = exports.updateWarehousebyIdService = exports.getSingleWarehoseByIdService = exports.getAllWarehouseFromDBService = exports.createWarehouseService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const warehouse_model_1 = __importDefault(require("./warehouse.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// create warehose service
const createWarehouseService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isWarehouseExists = yield warehouse_model_1.default.findOne({
        name: payload.name,
        isDeleted: { $ne: true },
    });
    if (isWarehouseExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Warehouse already exist!');
    }
    return yield warehouse_model_1.default.create(payload);
});
exports.createWarehouseService = createWarehouseService;
// get all warehouse
const getAllWarehouseFromDBService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const wareHouseQuery = new QueryBuilder_1.default(warehouse_model_1.default.find({ isDeleted: { $ne: true } }), query)
        .search(['name', 'location'])
        .filter()
        .fields()
        .paginate();
    const result = yield wareHouseQuery.modelQuery;
    const total = yield warehouse_model_1.default.countDocuments(wareHouseQuery.modelQuery.getFilter());
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const totalPages = Math.ceil(total / limit);
    const response = {
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
        data: result,
    };
    return response;
});
exports.getAllWarehouseFromDBService = getAllWarehouseFromDBService;
// get single warehouse
const getSingleWarehoseByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield warehouse_model_1.default.findOne({ _id: id, isDeleted: { $ne: true } }, // filter
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No Warehouse found. Failed to retrieve Warehouse.');
    }
    return result;
});
exports.getSingleWarehoseByIdService = getSingleWarehoseByIdService;
// update signle warehouse
const updateWarehousebyIdService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isWarehouseExists = yield warehouse_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    if (!isWarehouseExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'warehouse not found');
    }
    const result = yield warehouse_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
        projection: { isDeleted: 0 },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'warehouse not updated');
    }
    return result;
});
exports.updateWarehousebyIdService = updateWarehousebyIdService;
// delete one
const deleteWarehousebyIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield warehouse_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete warehouse');
    }
    return result;
});
exports.deleteWarehousebyIdService = deleteWarehousebyIdService;
