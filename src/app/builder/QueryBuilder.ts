import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchablefields: string[]) {
    const searchTerm =
      typeof this.query.searchTerm === 'string' ? this.query.searchTerm : undefined;

    if (searchTerm) {
      // Escape special regex characters to prevent MongoDB errors
      const escapedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );

      this.modelQuery = this.modelQuery.find({
        $or: searchablefields.map((field) => ({
          [field]: { $regex: escapedSearchTerm, $options: 'i' },
        })),
      });
    }

    return this;
  }
  filter() {
    const queryObj = { ...this.query };

    //Filtering
    const excludeFields = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
      'role',
    ];

    excludeFields.forEach((el) => delete queryObj[el]);

    if (queryObj.category) {
      queryObj.category = {
        $in: (queryObj.category as string).split(','),
      };
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    const querySort = this?.query?.sort;
    const sort = querySort || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
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
    const fields =
      (this?.query?.fields as string)?.split(',').join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
}

export default QueryBuilder;
