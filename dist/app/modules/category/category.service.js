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
exports.getSingleCategoryFromDbService = exports.deleCateogryService = exports.updateOneCateogryIntoDBService = exports.createCategoryIntoDBService = exports.getAllCategoryFromDBService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const category_model_1 = __importDefault(require("./category.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// create  category into database
const createCategoryIntoDBService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield category_model_1.default.create(payload);
});
exports.createCategoryIntoDBService = createCategoryIntoDBService;
// get all category service
const getAllCategoryFromDBService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryQuery = new QueryBuilder_1.default(category_model_1.default.find({ isDeleted: { $ne: true } }).populate("productsCount"), query)
        .search(['name', 'description'])
        .filter()
        .fields()
        .paginate();
    const result = yield categoryQuery.modelQuery;
    if (result.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Category not found!");
    }
    const total = yield category_model_1.default.countDocuments(categoryQuery.modelQuery.getFilter());
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
exports.getAllCategoryFromDBService = getAllCategoryFromDBService;
// get single cateogry by id
const getSingleCategoryFromDbService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.default.findById(id);
    if (!result || result.isDeleted === true) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found!');
    }
    return result;
});
exports.getSingleCategoryFromDbService = getSingleCategoryFromDbService;
// update category service
const updateOneCateogryIntoDBService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isCategoryExists = yield category_model_1.default.findById(id);
    if (!isCategoryExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'category not found');
    }
    const result = yield category_model_1.default.findOneAndUpdate({ _id: id }, payload, {
        runValidators: true,
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'category not updated');
    }
    return result;
});
exports.updateOneCateogryIntoDBService = updateOneCateogryIntoDBService;
// delete category service
const deleCateogryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isCategoryExists = yield category_model_1.default.findById(id);
    if (!isCategoryExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'category not found');
    }
    const result = yield category_model_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return result;
});
exports.deleCateogryService = deleCateogryService;
