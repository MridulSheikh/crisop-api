import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ICategory } from './category.interface';
import Category from './category.model';
import QueryBuilder from '../../builder/QueryBuilder';

// create  category into database
const createCategoryIntoDBService = async (payload: ICategory) => {
  return await Category.create(payload);
};

// get all category service
const getAllCategoryFromDBService = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(
    Category.find({ isDeleted: { $ne: true } }).populate("productsCount"),
    query,
  )
    .search(['name', 'description'])
    .filter()
    .fields()
    .paginate();

  const result = await categoryQuery.modelQuery;
  
  if(result.length === 0){
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!")
  }

  const total = await Category.countDocuments(
    categoryQuery.modelQuery.getFilter(),
  );

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const totalPages = Math.ceil(total / limit);

  const response = {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    data: result,
  };

  return response;
};

// get single cateogry by id
const getSingleCategoryFromDbService = async (id: string) => {
  const result = await Category.findById(id);
  if (!result || result.isDeleted === true) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  return result;
};

// update category service
const updateOneCateogryIntoDBService = async (
  id: string,
  payload: ICategory,
) => {
  const isCategoryExists = await Category.findById(id);

  if (!isCategoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'category not found');
  }

  const result = await Category.updateOne({ _id: id }, payload, {
    new: true, // returns the updated document
    runValidators: true, // runs schema validators
  });

  if (result.modifiedCount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'category not updated');
  }

  return result;
};

// delete category service
const deleCateogryService = async (id: string) => {
  const isCategoryExists = await Category.findById(id);

  if (!isCategoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'category not found');
  }

  const result = await Category.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

export {
  getAllCategoryFromDBService,
  createCategoryIntoDBService,
  updateOneCateogryIntoDBService,
  deleCateogryService,
  getSingleCategoryFromDbService,
};
