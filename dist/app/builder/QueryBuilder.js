"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchablefields) {
        const searchTerm = typeof this.query.searchTerm === 'string'
            ? this.query.searchTerm
            : undefined;
        if (searchTerm) {
            // Escape special regex characters to prevent MongoDB errors
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.modelQuery = this.modelQuery.find({
                $or: searchablefields.map((field) => ({
                    [field]: { $regex: escapedSearchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }
    filter() {
        const queryObj = Object.assign({}, this.query);
        // Filtering
        const excludeFields = [
            'searchTerm',
            'sort',
            'limit',
            'page',
            'fields',
            'role',
            'minPrice',
            'maxPrice',
        ];
        excludeFields.forEach((el) => delete queryObj[el]);
        // Category filter
        if (queryObj.category) {
            queryObj.category = {
                $in: queryObj.category.split(','),
            };
        }
        // brand filter
        if (queryObj.brand) {
            queryObj.brand = {
                $in: queryObj.brand.split(','),
            };
        }
        // Price filter ⭐ NEW
        const minPrice = Number(this.query.minPrice);
        const maxPrice = Number(this.query.maxPrice);
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            queryObj.discountPrice = {};
            if (!isNaN(minPrice)) {
                queryObj.discountPrice.$gte = minPrice;
            }
            if (!isNaN(maxPrice)) {
                queryObj.discountPrice.$lte = maxPrice;
            }
        }
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    sort() {
        var _a;
        const querySort = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.sort;
        const sort = querySort || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    paginate() {
        const page = Math.max(1, Number(this.query.page) || 1);
        const limit = Math.max(1, Number(this.query.limit) || 10);
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    fields() {
        var _a, _b;
        const fields = ((_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(',').join(' ')) || '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
}
exports.default = QueryBuilder;
