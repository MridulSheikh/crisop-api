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
