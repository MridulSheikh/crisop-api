import mongoose, { Model } from "mongoose";

/* eslint-disable no-unused-vars */
export enum UserRole {
  user = 'user',
  admin = 'admin',
  manager = 'manager',
}
export interface IUser {
  _id?: mongoose.Types.ObjectId,
  name: string;
  email: string;
  password: string;
  image: string;
  role: UserRole;
}


export interface UserModel extends Model<IUser> {
  isUserExsitsByUserEmail(email: string): Promise<IUser>;
  isPasswordMatch(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}