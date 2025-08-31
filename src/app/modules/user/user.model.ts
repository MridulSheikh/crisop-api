import { Schema, model } from 'mongoose';
import { IUser, UserModel, UserRole } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

// Mongoose schema
const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.user,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    needLogin: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  },
);

const expireResetPasswordLink = new Schema({
  token: {
    type: String,
    require: true,
    unique: true,
  },
});

const userEmailVerificationCenter = new Schema({
  email: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  expireIn: {
    type: Date,
    require: true,
  }
});

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  user.password = await bcrypt.hash(user.password, Number(config.BCRYPT_SALT));
  next();
});

userSchema.statics.isUserExsitsByUserName = async function (username: string) {
  const result = await User.findOne({ username }).select('+password');
  return result;
};

userSchema.statics.isUserExsitsByUserEmail = async (email: string) => {
  const result = await User.findOne({ email }).select('+password');
  return result;
};

userSchema.statics.isPasswordMatch = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

const User = model<IUser, UserModel>('User', userSchema);
export const ExpireResetPasswordLink = model(
  'ExpireResetPasswordLink',
  expireResetPasswordLink,
);
export const UserEmailVerificationCenter = model("userEmailVerificationCenter", userEmailVerificationCenter)
export default User;
