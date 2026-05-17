import mongoose, { Document } from "mongoose";

export interface IImageInterface {
    url: string,
    public_id: string,
}

export interface IProductInterface extends Document {
    name: string;                 
    description?: string;       
    price: number;              
    discountPrice?: number;      
    stock: mongoose.Schema.Types.ObjectId;              
    category: mongoose.Schema.Types.ObjectId;    
    brand: mongoose.Schema.Types.ObjectId;         
    tags?: string[];            
    images: IImageInterface[];          
    isFeatured?: boolean; 
    isDeleted: boolean;
    isPublished: boolean;
}


export type TSearchOptions = {
  page?: string | number;
  limit?: string | number;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
};