import mongoose, {Schema, Model } from 'mongoose';
import { IProductInterface } from './product.interface';

// 2. Create the Schema
const ProductSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true
  },
  description: { 
    type: String, 
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: { 
    type: Number, 
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(this: IProductInterface, value: number) {
        // Discount must be less than original price
        return value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  stock: { 
    type: Schema.Types.ObjectId, 
    ref: 'Stock', // Reference to Stock model
    required: [true, 'Stock reference is required']
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', // Reference to Category model
    required: [true, 'Category reference is required']
  },
  tags: { 
    type: [String], 
    default: [],
    validate: {
      validator: (tags: string[]) => tags.every(tag => tag.length > 0),
      message: 'Tags cannot contain empty strings'
    }
  },
  images: { 
    type: [String], 
    required: [true, 'At least one image is required'],
    validate: {
      validator: (images: string[]) => images.length > 0,
      message: 'At least one image is required'
    }
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  isPublished: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true } // Include virtuals when converting to plain objects
});

// 3. Add indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' }); // For text search
ProductSchema.index({ price: 1 }); // For sorting by price
ProductSchema.index({ category: 1, isPublished: 1 }); // For category filtering

// 4. Virtual for formatted price (optional)
// eslint-disable-next-line no-unused-vars
ProductSchema.virtual('formattedPrice').get(function(this: IProductInterface) {
  return `$${this.price.toFixed(2)}`;
});

// 5. Middleware for soft delete (optional)
ProductSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

ProductSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

// 6. Create the Model
const Product: Model<IProductInterface> = mongoose.model<IProductInterface>('Product', ProductSchema);

export default Product;