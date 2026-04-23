import { Types } from 'mongoose';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import { nanoid } from 'nanoid';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

export const createOrderIntoDbSerivce = async (
       payload: IOrder,
       userId: Types.ObjectId,
) => {
       // create order id
       payload.orderId = `ORD-${nanoid(10)}`;
       payload.customer = userId;

       if(!payload.isCod && !payload.isPaymentComplete){
              throw new AppError(httpStatus.BAD_REQUEST, "Please make payment!")
       }
       const result = await Order.create(payload);
       return result;
};

// toggle order status

export const toggleOrderStatus = async (_id: string, status: string) => {
       const isOrderExist = await Order.findOne({
              _id: _id,
              isCancel: { $ne: true },
       });

       if (!isOrderExist) {
              throw new AppError(
                     httpStatus.BAD_REQUEST,
                     'Faild to update status. please try again!',
              );
       }

       const result = await Order.findByIdAndUpdate(
              _id,
              { status },
              { new: true, runValidators: true },
       );

       if (!result) {
              throw new AppError(
                     httpStatus.BAD_REQUEST,
                     'Faild to update status. please try again!',
              );
       }

       return result;
};


// get all order from db
export const getMyOrderFromDbServices = async (userId: string) => {
  const result = await Order.find({
    customer: new Types.ObjectId(userId),
  })
    .populate("items.product")
    .sort({ createdAt: -1 });

  return result;
};

// cancel order
export const canceledOrderServices = async (orderId: string) => {
  const order = await Order.findById(orderId);

  // order not found
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // already cancelled
  if (order.isCancel) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order already cancelled");
  }

  // prevent cancel after shipping
  if (["shipped", "delivered"].includes(order.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel after order is shipped or delivered"
    );
  }

  const result = await Order.findByIdAndUpdate(
    orderId,
    { isCancel: true, status: "pending" }, // optional status lock
    { new: true } // return updated doc
  );

  return result;
};