import mongoose from "mongoose";

export interface IStock {
    productName: string;
    sku: string;
    quantity: number;
    warehouse: mongoose.Schema.Types.ObjectId;
    isDeleted?: boolean;
}