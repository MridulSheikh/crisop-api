import mongoose, { Document } from "mongoose";

export interface IProductInterface extends Document {
    name: string;                 
    description?: string;       
    price: number;              
    discountPrice?: number;      
    stock: mongoose.Schema.Types.ObjectId;              
    category: mongoose.Schema.Types.ObjectId;            
    tags?: string[];            
    images: string[];          
    isFeatured?: boolean; 
    isDeleted: boolean;
    isPublished: boolean;
}