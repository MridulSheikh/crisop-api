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
exports.updateBrandIntoDBService = exports.softDeleteBrandFromDBService = exports.hardDeleteBrandFromDBService = exports.getSingleBrandFromDBService = exports.getAllBrandFromDBService = exports.createBrandIntoDBService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const fs_1 = __importDefault(require("fs"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const brand_model_1 = __importDefault(require("./brand.model"));
const cloudinary_1 = require("cloudinary");
const deleteBrandImageFromCloudinary = (img) => __awaiter(void 0, void 0, void 0, function* () {
    const publicId = typeof img === 'string' ? undefined : img === null || img === void 0 ? void 0 : img.public_id;
    if (!publicId) {
        return;
    }
    const resCloudinary = yield cloudinary_1.v2.uploader.destroy(publicId);
    if (!['ok', 'not found'].includes(resCloudinary.result)) {
        throw new AppError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, 'We were unable to delete the image. Please try again.');
    }
});
const createBrandIntoDBService = (payload, 
// eslint-disable-next-line no-undef
file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please upload brand image!');
    }
    const isBrandExists = yield brand_model_1.default.findOne({
        name: payload.name,
        isDeleted: { $ne: true },
    });
    if (isBrandExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Brand already exist!');
    }
    const uploadedImage = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, {
        folder: 'brands',
    });
    const result = yield brand_model_1.default.create(Object.assign(Object.assign({}, payload), { img: {
            url: uploadedImage.url,
            public_id: uploadedImage.public_id,
        } }));
    fs_1.default.unlinkSync(file.path);
    return result;
});
exports.createBrandIntoDBService = createBrandIntoDBService;
const getAllBrandFromDBService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const brandQuery = new QueryBuilder_1.default(brand_model_1.default.find({ isDeleted: { $ne: true } }), query)
        .search(['name'])
        .filter()
        .sort()
        .fields()
        .paginate();
    const result = yield brandQuery.modelQuery;
    const total = yield brand_model_1.default.countDocuments(brandQuery.modelQuery.getFilter());
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
exports.getAllBrandFromDBService = getAllBrandFromDBService;
const getSingleBrandFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield brand_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found!');
    }
    return result;
});
exports.getSingleBrandFromDBService = getSingleBrandFromDBService;
const updateBrandIntoDBService = (id, payload, 
// eslint-disable-next-line no-undef
file) => __awaiter(void 0, void 0, void 0, function* () {
    const brand = yield brand_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    if (!brand) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found!');
    }
    const updateData = {};
    if (payload.name) {
        updateData.name = payload.name;
    }
    if (file) {
        const uploadedImage = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, {
            folder: 'brands',
        });
        updateData.img = {
            url: uploadedImage.url,
            public_id: uploadedImage.public_id,
        };
        fs_1.default.unlinkSync(file.path);
        yield deleteBrandImageFromCloudinary(brand.img);
    }
    const result = yield brand_model_1.default.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Brand not updated!');
    }
    return result;
});
exports.updateBrandIntoDBService = updateBrandIntoDBService;
const softDeleteBrandFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const brand = yield brand_model_1.default.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!brand) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found!');
    }
    yield deleteBrandImageFromCloudinary(brand.img);
    const result = yield brand_model_1.default.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found!');
    }
    return result;
});
exports.softDeleteBrandFromDBService = softDeleteBrandFromDBService;
const hardDeleteBrandFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const brand = yield brand_model_1.default.findById(id);
    if (!brand) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Brand not found!');
    }
    yield deleteBrandImageFromCloudinary(brand.img);
    const result = yield brand_model_1.default.findByIdAndDelete(id);
    return result;
});
exports.hardDeleteBrandFromDBService = hardDeleteBrandFromDBService;
