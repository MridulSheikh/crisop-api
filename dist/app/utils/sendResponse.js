"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    const preResponse = {
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
    };
    if (data.meta) {
        preResponse.meta = data.meta;
    }
    res.status(data === null || data === void 0 ? void 0 : data.statusCode).json(preResponse);
};
exports.default = sendResponse;
