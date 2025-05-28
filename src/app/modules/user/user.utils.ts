import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from './user.interface';
export const createToken = (
  jwtPayload: { _id: Types.ObjectId; role: UserRole; email: string },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};