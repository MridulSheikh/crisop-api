"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToArray = exports.normalizeArray = void 0;
const normalizeArray = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value;
    return [value]; // single → array বানায়
};
exports.normalizeArray = normalizeArray;
const parseToArray = (val) => {
    val = (0, exports.normalizeArray)(val);
    if (!val)
        return [];
    // already array
    if (Array.isArray(val))
        return val;
    // single string
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            // if JSON array
            if (Array.isArray(parsed))
                return parsed;
            // single value
            return [parsed];
        }
        catch (_a) {
            return [val];
        }
    }
    return [];
};
exports.parseToArray = parseToArray;
