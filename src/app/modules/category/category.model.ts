import { Schema, Document, model } from 'mongoose';
import { ICategory } from './category.interface';

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema: Schema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isDeleted:{
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
  }
);

const Category = model<ICategoryDocument>('Category', CategorySchema);

export default Category;
