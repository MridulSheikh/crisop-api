/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import jwt from 'jsonwebtoken';

import { UserRole } from '../modules/user/user.interface';
import User from '../modules/user/user.model';

export type TUserRole = keyof typeof UserRole;

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not Authorized');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.JWT_ACCESS_SECRET as string,
      ) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        // if token expired
        throw new AppError(httpStatus.UNAUTHORIZED, 'TokenExpired');
      }
      throw new AppError(httpStatus.FORBIDDEN, 'Invalid token');
    }

    const { role, email } = decoded;

    const user = await User.isUserExsitsByUserEmail(email);

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User not found!');
    }

    if (user.needLogin) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User login needed!');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
