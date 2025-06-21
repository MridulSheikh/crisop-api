import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IWarehouse } from './warehouse.interface';
import Warehouse from './warehouse.model';

// create warehose service
const createWarehouseService = async (payload: IWarehouse) => {
  return await Warehouse.create(payload);
};

// get all warehouse
const getAllWarehouseFromDBService = async () => {
  const result = await Warehouse.find(
    { isDeleted: { $ne: true } },
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 },
  );

  if (result.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No Warehouse found. Failed to retrieve Warehouse.',
    );
  }

  return result;
};

// get single warehouse
const getSingleWarehoseByIdService = async (id: string) => {
  const result = await Warehouse.findOne(
    { _id: id, isDeleted: { $ne: true } }, // filter
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0  }, // projection: exclude isDeleted
  );

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No Warehouse found. Failed to retrieve Warehouse.',
    );
  }

  return result;
};

// update signle warehouse
const updateWarehousebyIdService = async (id: string, payload: IWarehouse) => {
  const isWarehouseExists = await Warehouse.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if(!isWarehouseExists){
     throw new AppError(httpStatus.NOT_FOUND, 'warehouse not found');
  }

  const result = await Warehouse.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    projection: {isDeleted: 0}
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'warehouse not updated');
  }

  return result;
};

// delete one
const deleteWarehousebyIdService = async (id: string) => {
  const result = await Warehouse.findByIdAndUpdate(id, { isDeleted: true });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete warehouse');
  }

  return result;
};

export {
  createWarehouseService,
  getAllWarehouseFromDBService,
  getSingleWarehoseByIdService,
  updateWarehousebyIdService,
  deleteWarehousebyIdService,
};
