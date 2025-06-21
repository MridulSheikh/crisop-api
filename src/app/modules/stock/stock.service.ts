import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IStock } from './stock.interface';
import Stock from './stock.model';
import gsku from '../../helpers/gsku';
import Warehouse from '../warehouse/warehouse.model';

// post stok in database
const createStockIntoDBService = async (payload: IStock) => {
  // generate sku dynamacilly
  const sku = await gsku(payload.productName);

  if (sku) {
    payload.sku = sku;
  }

  // check warehouse is exists
  const isWarehouseExists = await Warehouse.findOne({
    _id: payload.warehouse,
    isDeleted: { $ne: true },
  });

  if (!isWarehouseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Warehouse not found!');
  }

  const result = await Stock.create(payload);
  return {
    productName: result.productName,
    sku: result.sku,
    insertedId: result._id,
  };
};

// get all stock
const getAllStockFromDBService = async () => {
  const result = await Stock.find(
    { isDeleted: { $ne: true } },
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 },
  ).populate('warehouse', 'name location capacity -_id');

  if (result.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No Stock found. Failed to retrieve Stock.',
    );
  }

  return result;
};

// get single stock
const getSingleStockFromDBService = async (id: string) => {
  const result = await Stock.findOne(
    { _id: id, isDeleted: { $ne: true } }, // filter
    { isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 }, // projection: exclude isDeleted
  ).populate('warehouse', 'name location capacity');

  // if stock not found
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No Stock found. Failed to retrieve Stock.',
    );
  }

  // if document soft deleted
  if (result.isDeleted) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No Stock found. Failed to retrieve Stock.',
    );
  }

  return result;
};

// Removed single stock from service
const removedSingleStockFromDBService = async (id: string) => {
  // check if stock exists in database
  const isExistStockInDB = await Stock.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  // is exist stock in db
  if (!isExistStockInDB) {
    throw new AppError(httpStatus.NOT_FOUND, 'Stock not found!');
  }

  // soft deleted
  const result = await Stock.findByIdAndUpdate(id, { isDeleted: true });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete warehouse');
  }

  return {
    id: result._id,
  };
};

// update single stock from service
const updateSingleStockFromDbService = async (id: string, payload: IStock) => {
  const isStockExistsInDatabase = await Stock.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  // Is stock exists
  if (!isStockExistsInDatabase) {
    throw new AppError(httpStatus.NOT_FOUND, 'Stock not found!');
  }

  // update stock single
  const result = await Stock.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    projection: { isDeleted: 0 },
  });

  // Is failed update stock
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'stock not updated');
  }

  return result;
};

export {
  createStockIntoDBService,
  getAllStockFromDBService,
  getSingleStockFromDBService,
  removedSingleStockFromDBService,
  updateSingleStockFromDbService,
};
