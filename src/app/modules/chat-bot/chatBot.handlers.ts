import QueryBuilder from "../../builder/QueryBuilder";
import { getCategoryIdByNameServices } from "../category/category.service";
import Product from "../product/product.model";

// ======================================================
// PRODUCT SEARCH
// ======================================================

export const handleProductSearchByChatBot = async (
  analysis: any
) => {
  const categoryId =
    await getCategoryIdByNameServices(
      analysis.category
    );

  const baseFilter: any = {
    name: {
      $regex: analysis.searchQuery,
      $options: "i",
    },
  };

  // category filter
  if (categoryId) {
    baseFilter.category = categoryId;
  }

  // budget filter
  if (
    analysis.budget?.max ||
    analysis.budget?.min
  ) {
    baseFilter.price = {};

    if (analysis.budget?.min) {
      baseFilter.price.$gte =
        analysis.budget.min;
    }

    if (analysis.budget?.max) {
      baseFilter.price.$lte =
        analysis.budget.max;
    }
  }

  const productQuery = new QueryBuilder(
    Product.find(baseFilter)
      .populate("stock", "quantity")
      .populate("category", "name"),
    {}
  )
    .search(["name", "description", "tags"])
    .filter()
    .fields()
    .sort();

  const products = await productQuery.modelQuery;

  // no products
  if (!products.length) {
    return {
      type: "text",

      message: `Sorry 😔 I couldn't find any products for "${analysis.searchQuery}". Try searching with different keywords.`,

      products: [],
    };
  }

  // build response message
  const message = `
I found ${products.length} ${
    analysis.category || ""
  } product${
    products.length > 1 ? "s" : ""
  } for you 🛒

${
  analysis.budget?.max
    ? `Showing products within your budget of ${analysis.budget.max} BDT.\n`
    : ""
}

Here are some recommended options based on your search.
`;

  return {
    type: "products",
    message,
    products,
  };
};

// ======================================================
// PRODUCT DETAILS
// ======================================================

export const getProductDetailsByChatBot =
  async (analysis: any) => {
    const product = await Product.findOne({
      name: {
        $regex: analysis.searchQuery,
        $options: "i",
      },
    })
      .populate("category", "name")
      .populate(
        "stock",
        "quantity warehouse unit"
      );

    // not found
    if (!product) {
      return {
        type: "text",

        message: `Sorry 😔 I couldn't find any product named "${analysis.searchQuery}".`,
      };
    }

    const stock =
      (product as any)?.stock?.quantity || 0;

    const category =
      (product as any)?.category?.name ||
      "Unknown";

    const stockText =
      stock > 0
        ? `✅ In Stock (${stock} available)`
        : "❌ Out of Stock";

    return {
      type: "product_detail",

      message: `
🐟 ${product.name}

💰 Price: ${product.price} BDT
📂 Category: ${category}
📦 ${stockText}

${
  analysis.recommendationHint ||
  "This product is available in our store."
}
      `,

      products: [product],
    };
  };

// ======================================================
// CATEGORY BROWSE
// ======================================================

export const handleCategoryBrowseByChatBot =
  async (analysis: any) => {
    const categoryId =
      await getCategoryIdByNameServices(
        analysis.category
      );

    if (!categoryId) {
      return {
        type: "text",

        message: `Sorry 😔 I couldn't find the "${analysis.category}" category.`,
      };
    }

    const baseFilter: any = {
      category: categoryId,
    };

    // budget
    if (
      analysis.budget?.max ||
      analysis.budget?.min
    ) {
      baseFilter.price = {};

      if (analysis.budget?.min) {
        baseFilter.price.$gte =
          analysis.budget.min;
      }

      if (analysis.budget?.max) {
        baseFilter.price.$lte =
          analysis.budget.max;
      }
    }

    const productQuery = new QueryBuilder(
      Product.find(baseFilter)
        .populate("stock", "quantity")
        .populate("category", "name"),
      {}
    )
      .filter()
      .sort()
      .fields();

    const products = await productQuery.modelQuery;

    if (!products.length) {
      return {
        type: "text",

        message: `No products available in the ${analysis.category} category right now.`,
      };
    }

    return {
      type: "category",

      message: `
Browsing ${
        analysis.category
      } category 🛒

Found ${products.length} product${
        products.length > 1 ? "s" : ""
      } available in this category.

${
  analysis.budget?.max
    ? `Showing products under ${analysis.budget.max} BDT.`
    : ""
}
      `,

      products,
    };
  };