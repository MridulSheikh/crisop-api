import { Schema, model } from 'mongoose';
import { IOrder, IOrderItem } from './order.interface';


// Define the schema
const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shippingInfo: {
      addressOneLine: { type: String, required: true },
      type: {
        type: String,
        enum: ['Standard', '24h', '3d'],
        required: true,
      },
      contact: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'packing', 'shipped', 'delivered'],
      default: 'pending',
    },
    isCancel: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create the model
export const Order = model<IOrder>('Order', orderSchema);
