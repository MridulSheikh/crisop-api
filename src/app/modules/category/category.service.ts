import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ICategory } from './category.interface';
import Category from './category.model';

// create  category into database
const createCategoryIntoDBService = async (payload: ICategory) => {
    return await Category.create(payload);
};

// get all category service
const getAllCategoryFromDBService = async () => {
    const result = await Category.find({ isDeleted: { $ne: true } }, {isDeleted: 0});
    if (result.length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No categories found. Failed to retrieve categories.',
        );
    }
    return result;
};

// get single cateogry by id
const getSingleCategoryFromDbService = async (id: string) =>{
    const result = await Category.findById(id);
    if(!result || result.isDeleted === true){
         throw new AppError(
            httpStatus.NOT_FOUND,
            'Category not found!',
        );
    }

    return result;
}

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

    if(result.modifiedCount === 0){
        throw new AppError(httpStatus.BAD_REQUEST, 'category not updated');
    }

    return result;
};

// delete category service
const deleCateogryService = async (id: string) =>{
    const isCategoryExists = await Category.findById(id);

    if (!isCategoryExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'category not found');
    }

    const result = await Category.findByIdAndUpdate(id,{isDeleted: true},{new: true});

    return result;
}

export { getAllCategoryFromDBService, createCategoryIntoDBService, updateOneCateogryIntoDBService, deleCateogryService, getSingleCategoryFromDbService };
