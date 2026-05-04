"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
};
const setAuthCookies = (res, tokens) => {
    if (tokens.accessToken) {
        res.cookie("accessToken", tokens.accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 3 * 60 * 60 * 1000 }));
    }
    if (tokens.refreshToken) {
        res.cookie("refreshToken", tokens.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 30 * 24 * 60 * 60 * 1000 }));
    }
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
};
exports.clearAuthCookies = clearAuthCookies;
