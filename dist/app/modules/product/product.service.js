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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atlasProductSearchService = exports.toggleFeaturedStatusService = exports.removeSingleProductFromDBService = exports.updateSingleProductInDBService = exports.getSingleProductFromDBService = exports.getAllProductsFromDBService = exports.createProductIntoDBService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("./product.model"));
const stock_model_1 = __importDefault(require("../stock/stock.model"));
const category_model_1 = __importDefault(require("../category/category.model"));
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const fs_1 = __importDefault(require("fs"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const cloudinary_1 = require("cloudinary");
const brand_model_1 = __importDefault(require("../brand/brand.model"));
const parseIds_1 = require("../../helpers/parseIds");
// Create new product
const createProductIntoDBService = (payload, 
// eslint-disable-next-line no-undef
files) => __awaiter(void 0, void 0, void 0, function* () {
    // Image reauired validation
    if (!files || files.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please Upload Product Image!');
    }
    // Validate references exist
    const [stockExists, categoryExists, brandExists] = yield Promise.all([
        stock_model_1.default.findOne({ _id: payload.stock, isDeleted: { $ne: true } }),
        category_model_1.default.findOne({ _id: payload.category, isDeleted: { $ne: true } }),
        brand_model_1.default.findOne({ _id: payload.brand, isDeleted: { $ne: true } }),
    ]);
    if (!stockExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced stock not found');
    }
    if (!categoryExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced category not found');
    }
    if (!brandExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced brand not found');
    }
    // Validate discount price
    if (payload.discountPrice && payload.discountPrice > payload.price) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid Discount Price!');
    }
    // ☁️ Upload images to cloudinary
    const uploadedImages = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, {
            folder: 'products',
        });
        return {
            url: result.url,
            public_id: result.public_id,
        };
    })));
    const result = yield product_model_1.default.create(Object.assign(Object.assign({}, payload), { images: uploadedImages, isFeatured: payload.isFeatured || false, isDeleted: false, isPublished: payload.isPublished || false }));
    //  delete local files
    files.forEach((file) => fs_1.default.unlinkSync(file.path));
    return {
        body: result,
        insertedId: result._id,
    };
});
exports.createProductIntoDBService = createProductIntoDBService;
// Get all products (with filters)
const getAllProductsFromDBService = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isDeleted: { $ne: true },
    };
    // Apply condition dynamically
    if (options === null || options === void 0 ? void 0 : options.onlyPublished) {
        baseFilter.isPublished = { $ne: false };
    }
    const productQuery = new QueryBuilder_1.default(product_model_1.default.find(baseFilter)
        .populate({
        path: 'stock',
        select: 'quantity warehouse unit productName',
        populate: {
            path: 'warehouse',
            select: 'name location',
        },
    })
        .populate('category', 'name')
        .populate('brand'), query)
        .search(['name', 'description', 'tags'])
        .filter()
        .fields()
        .sort()
        .paginate();
    const result = yield productQuery.modelQuery;
    const total = yield product_model_1.default.countDocuments(productQuery.modelQuery.getFilter());
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
exports.getAllProductsFromDBService = getAllProductsFromDBService;
// Get single product by ID
const getSingleProductFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid product ID');
    }
    const result = yield product_model_1.default.findOne({ _id: id, isDeleted: { $ne: true } }, { isDeleted: 0, __v: 0 })
        .populate('stock', 'quantity warehouse unit')
        .populate('category', 'name')
        .populate('brand');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    return result;
});
exports.getSingleProductFromDBService = getSingleProductFromDBService;
const updateSingleProductInDBService = (id, payload, 
// eslint-disable-next-line no-undef
files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid product ID');
    }
    const product = yield product_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found!');
    }
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { isDeleted, removedImages } = payload, updateData = __rest(payload, ["isDeleted", "removedImages"]);
    const imageIdsToRemove = (removedImages !== null && removedImages !== void 0 ? removedImages : [])
        .map((image) => {
        var _a;
        return typeof image === 'string'
            ? (_a = JSON.parse(image)) === null || _a === void 0 ? void 0 : _a.public_id
            : image === null || image === void 0 ? void 0 : image.public_id;
    })
        .filter(Boolean);
    // STOCK VALIDATION
    if (updateData.stock) {
        const stockExists = yield stock_model_1.default.findOne({
            _id: updateData.stock,
            isDeleted: { $ne: true },
        });
        if (!stockExists) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced stock not found');
        }
    }
    // CATEGORY VALIDATION
    if (updateData.category) {
        const categoryExists = yield category_model_1.default.findOne({
            _id: updateData.category,
            isDeleted: { $ne: true },
        });
        if (!categoryExists) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced category not found');
        }
    }
    // Brand Validation
    if (updateData.brand) {
        const brandExists = yield brand_model_1.default.findOne({
            _id: updateData.brand,
            isDeleted: { $ne: true },
        });
        if (!brandExists) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Referenced Brand not found');
        }
    }
    // DISCOUNT VALIDATION
    if (updateData.discountPrice) {
        const basePrice = (_a = updateData.price) !== null && _a !== void 0 ? _a : product.price;
        if (updateData.discountPrice > basePrice) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Discount price must be less than price');
        }
    }
    // REMOVE OLD IMAGES (Cloudinary)
    if (imageIdsToRemove.length) {
        yield Promise.all(imageIdsToRemove === null || imageIdsToRemove === void 0 ? void 0 : imageIdsToRemove.map((public_id) => __awaiter(void 0, void 0, void 0, function* () {
            const resCloudinary = yield cloudinary_1.v2.uploader.destroy(public_id);
            if (resCloudinary.result != 'ok') {
                throw new AppError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, 'We were unable to delete the image. Please try again.');
            }
        })));
        product.images = (_b = product.images) === null || _b === void 0 ? void 0 : _b.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (img) => !imageIdsToRemove.includes(img.public_id));
    }
    // UPLOAD NEW IMAGES
    if (files === null || files === void 0 ? void 0 : files.length) {
        const uploadedImages = yield Promise.all(files === null || files === void 0 ? void 0 : files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, {
                folder: 'products',
            });
            fs_1.default.unlinkSync(file.path);
            return {
                url: result.url,
                public_id: result.public_id,
            };
        })));
        product.images.push(...uploadedImages);
    }
    // UPDATE OTHER FIELDS
    Object.assign(product, updateData);
    const updated = yield product.save();
    return updated;
});
exports.updateSingleProductInDBService = updateSingleProductInDBService;
// Soft delete product
const removeSingleProductFromDBService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid product ID');
    }
    const result = yield product_model_1.default.findByIdAndUpdate(id, { isDeleted: true, isPublished: false }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found or delete failed');
    }
    return {
        id: result._id,
        name: result.name,
        status: 'Soft deleted successfully',
    };
});
exports.removeSingleProductFromDBService = removeSingleProductFromDBService;
// Toggle featured status
const toggleFeaturedStatusService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid product ID');
    }
    const product = yield product_model_1.default.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    product.isFeatured = !product.isFeatured;
    yield product.save();
    return {
        id: product._id,
        name: product.name,
        isFeatured: product.isFeatured,
    };
});
exports.toggleFeaturedStatusService = toggleFeaturedStatusService;
const atlasProductSearchService = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const searchTerm = typeof query === 'string' ? query.trim() : '';
    // pagination
    const page = Math.max(1, Number(options === null || options === void 0 ? void 0 : options.page) || 1);
    const limit = Math.max(1, Number(options === null || options === void 0 ? void 0 : options.limit) || 10);
    const skip = (page - 1) * limit;
    const brandIds = (0, parseIds_1.parseIds)(options === null || options === void 0 ? void 0 : options.brand);
    const categoryIds = (0, parseIds_1.parseIds)(options === null || options === void 0 ? void 0 : options.category);
    const minPrice = Number(options === null || options === void 0 ? void 0 : options.minPrice);
    const maxPrice = Number(options === null || options === void 0 ? void 0 : options.maxPrice);
    const pipeline = [];
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
    pipeline.push({
        $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand',
        },
    }, {
        $unwind: {
            path: '$brand',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
        },
    }, {
        $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
        },
    });
    // ======================
    // 🎯 FILTER STAGE
    // ======================
    const matchStage = {
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
    }
    else {
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
    const data = yield product_model_1.default.aggregate(pipeline);
    // ======================
    // 📊 TOTAL COUNT
    // ======================
    const countPipeline = [];
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
    countPipeline.push({
        $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand',
        },
    }, {
        $unwind: {
            path: '$brand',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
        },
    }, {
        $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $match: Object.assign(Object.assign({ isDeleted: { $ne: true } }, (brandIds.length && { brand: { $in: brandIds } })), (categoryIds.length && { category: { $in: categoryIds } })),
    }, {
        $count: 'total',
    });
    const totalAgg = yield product_model_1.default.aggregate(countPipeline);
    const total = ((_a = totalAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    return {
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
exports.atlasProductSearchService = atlasProductSearchService;
