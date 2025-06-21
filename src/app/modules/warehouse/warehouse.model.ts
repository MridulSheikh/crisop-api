// src/app/modules/warehouse/warehouse.model.ts

import { Schema, model } from 'mongoose';
import { IWarehouse } from './warehouse.interface';

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Warehouse = model<IWarehouse>('Warehouse', warehouseSchema);

export default Warehouse;
