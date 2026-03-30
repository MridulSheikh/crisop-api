import { Schema, Document, model, Types } from "mongoose";
import { ICategory } from "./category.interface";

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
  productsCount?: number; 
}

const CategorySchema = new Schema<ICategoryDocument>(
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
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CategorySchema.virtual("productsCount", {
  ref: "Product",          
  localField: "_id",       
  foreignField: "category",
  count: true,            
});

const Category = model<ICategoryDocument>("Category", CategorySchema);

export default Category;