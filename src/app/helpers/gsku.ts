import { nanoid } from 'nanoid';
import Stock from '../modules/stock/stock.model';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const DEFAULT_SKU_LENGTH = 6;
const MAX_ATTEMPTS = 10;

const gsku = async (productName: string): Promise<string> => {
  if (!productName?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST,'Product name must be at least 1 character');
  }
  // Clean and get base
  const cleanedName = productName.replace(/\s+/g, '');
  const base = cleanedName.slice(0, 3).toUpperCase();

  // Generate unique SKU
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const randomId = nanoid(DEFAULT_SKU_LENGTH).toUpperCase();
    const sku = `${base}-${randomId}`;

    const existing = await Stock.findOne({ sku });
    if (!existing) {
      return sku;  // This is now properly using the sku declared in this block
    }
  }

  throw new AppError(httpStatus.BAD_REQUEST,'Failed to generate unique SKU after multiple attempts');
};

export default gsku;