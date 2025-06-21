import { Schema, model } from "mongoose";
import { IStock } from "./stock.interface";

const stockSchema = new Schema<IStock>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Stock = model<IStock>("Stock", stockSchema);

export default Stock;
