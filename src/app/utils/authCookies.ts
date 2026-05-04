import { Response } from "express";

const cookieOptions = {
  httpOnly: true,
  secure: false,         
  sameSite: "none" as const,
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken?: string; refreshToken?: string }
) => {
  if (tokens.accessToken) {
    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 3 * 60 * 60 * 1000,
    });
  }

  if (tokens.refreshToken) {
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};