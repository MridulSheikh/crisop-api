"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleDuplicateError = (err) => {
    const statusCode = 400;
    return {
        statusCode,
        message: 'Duplicate Error',
        errorMessage: `${err.keyValue[Object.keys(err.keyValue)[0]]} already exists.`,
        errorDetails: err,
    };
};
exports.default = handleDuplicateError;
