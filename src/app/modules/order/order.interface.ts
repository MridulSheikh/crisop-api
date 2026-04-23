import  { Document, Types } from "mongoose";

// Interface for individual order items
export interface IOrderItem {
  product: Types.ObjectId;       
  quantity: number;
  price: number;
}

// Interface for the whole order
export interface IOrder extends Document {
  orderId: string;
  customer: Types.ObjectId;
  shippingInfo: {
    addressOneLine: string;
    type: 'Standard' | '24h' | '3d';
    contact: string;
    email: string;
    division: string;
  };
  items: IOrderItem[];
  status: 'pending' | 'packing' | 'shipped' | 'delivered'; 
  isCancel: boolean;
  isCod: boolean;
  isPaymentComplete: boolean;
  total: number;
}
