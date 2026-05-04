"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getSingleOrder = exports.getAllOrderFromdbServices = exports.canceledOrderServices = exports.getMyOrderFromDbServices = exports.toggleOrderStatus = exports.createOrderIntoDbSerivce = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const order_model_1 = require("./order.model");
const nanoid_1 = require("nanoid");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const createOrderIntoDbSerivce = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // create order id
    payload.orderId = `ORD-${(0, nanoid_1.nanoid)(10)}`;
    payload.customer = userId;
    if (!payload.isCod && !payload.isPaymentComplete) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please make payment!');
    }
    const result = yield order_model_1.Order.create(payload);
    return result;
});
exports.createOrderIntoDbSerivce = createOrderIntoDbSerivce;
// toggle order status
const toggleOrderStatus = (_id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isOrderExist = yield order_model_1.Order.findOne({
        _id: _id,
        isCancel: { $ne: true },
    });
    if (!isOrderExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Faild to update status. please try again!');
    }
    // update payload dynamically
    const updatePayload = {
        status,
    };
    // business rule
    if (status === 'delivered') {
        updatePayload.isPaymentComplete = true;
    }
    const result = yield order_model_1.Order.findByIdAndUpdate(_id, updatePayload, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Faild to update status. please try again!');
    }
    return result;
});
exports.toggleOrderStatus = toggleOrderStatus;
// get all order from db
const getMyOrderFromDbServices = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.Order.find({
        customer: new mongoose_1.Types.ObjectId(userId),
    })
        .populate('items.product')
        .sort({ createdAt: -1 });
    return result;
});
exports.getMyOrderFromDbServices = getMyOrderFromDbServices;
// cancel order
const canceledOrderServices = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId);
    // order not found
    if (!order) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Order not found');
    }
    // already cancelled
    if (order.isCancel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order already cancelled');
    }
    // prevent cancel after shipping
    if (['shipped', 'delivered'].includes(order.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot cancel after order is shipped or delivered');
    }
    const result = yield order_model_1.Order.findByIdAndUpdate(orderId, { isCancel: true, status: 'pending' }, // optional status lock
    { new: true });
    return result;
});
exports.canceledOrderServices = canceledOrderServices;
const getAllOrderFromdbServices = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isCancel: { $ne: true },
    };
    const orderQuery = new QueryBuilder_1.default(order_model_1.Order.find(baseFilter).populate('items.product'), query)
        .search(['orderId', 'shippingInfo.email'])
        .filter()
        .fields()
        .sort()
        .paginate();
    const result = yield orderQuery.modelQuery;
    const total = yield order_model_1.Order.countDocuments(orderQuery.modelQuery.getFilter());
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
        items: result,
    };
});
exports.getAllOrderFromdbServices = getAllOrderFromdbServices;
const getSingleOrder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate MongoDB ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(400, 'Invalid order id');
    }
    // Find order
    const order = yield order_model_1.Order.findById(id)
        .populate('items.product') // optional (if needed)
        .lean();
    // Check existence
    if (!order) {
        throw new AppError_1.default(404, 'Order not found');
    }
    return order;
});
exports.getSingleOrder = getSingleOrder;
