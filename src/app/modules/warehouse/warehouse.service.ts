import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IWarehouse } from "./warehouse.interface";
import Warehouse from "./warehouse.model";


// create warehose service
const createWarehouseService = async (payload: IWarehouse) =>{
      return await Warehouse.create(payload)
}

// get all warehouse 
const getAllWarehouseFromDBService = async () =>{
    const result = await Warehouse.find();
    
    if(result.length === 0){
         throw new AppError(
            httpStatus.NOT_FOUND,
            'No Warehouse found. Failed to retrieve Warehouse.',
        );
    }

    return result;
}

// get single warehose by id
const getSingleWarehoseById = async (id: string) => {
    const result = await Warehouse.findById(id);
    return result;
}

export {
    createWarehouseService,
    getAllWarehouseFromDBService,
    getSingleWarehoseById
}