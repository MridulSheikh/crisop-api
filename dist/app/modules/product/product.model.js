"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// 2. Create the Schema
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
        trim: true,
    },
    description: {
        type: String,
        minlength: [20, 'Description too short'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        validate: {
            validator: function (value) {
                // Discount must be less than original price
                return value <= this.price;
            },
            message: 'Invalid discount price!',
        },
    },
    stock: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Stock', // Reference to Stock model
        required: [true, 'Stock reference is required'],
    },
    brand: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'brand', // Reference to Stock model
        required: [true, 'brand reference is required'],
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category', // Reference to Category model
        required: [true, 'Category reference is required'],
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (tags) => tags.every((tag) => tag.length > 0),
            message: 'Tags cannot contain empty strings',
        },
    },
    images: {
        type: [
            {
                url: { type: String, required: true },
                public_id: { type: String, required: true },
            },
        ],
        required: [true, 'At least one image is required'],
        validate: {
            validator: (images) => images.length > 0,
            message: 'At least one image is required',
        },
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to plain objects
});
// 3. Add indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' }); // For text search
ProductSchema.index({ price: 1 }); // For sorting by price
ProductSchema.index({ category: 1, isPublished: 1 }); // For category filtering
// 4. Virtual for formatted price (optional)
// eslint-disable-next-line no-unused-vars
ProductSchema.virtual('formattedPrice').get(function () {
    return `$${this.price.toFixed(2)}`;
});
// 5. Middleware for soft delete (optional)
ProductSchema.pre('find', function () {
    this.where({ isDeleted: false });
});
ProductSchema.pre('findOne', function () {
    this.where({ isDeleted: false });
});
// 6. Create the Model
const Product = mongoose_1.default.model('Product', ProductSchema);
exports.default = Product;
