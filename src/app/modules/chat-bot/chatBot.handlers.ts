import QueryBuilder from "../../builder/QueryBuilder";
import { getCategoryIdByNameServices } from "../category/category.service";
import Product from "../product/product.model";
import { atlasProductSearchService } from "../product/product.service";

// ======================================================
// PRODUCT SEARCH
// ======================================================

export const handleProductSearchByChatBot = async (analysis: any) => {
  const isCategoryBrowse = analysis.intent === "category_browse";
  const isDetail = analysis.intent === "product_detail";

  // =========================
  // 🧠 PRODUCT DETAIL
  // =========================
  if (isDetail) {
    return {
      type: "product_detail",
      message: `Searching product details for "${analysis.searchQuery}"`,
      ...(await atlasProductSearchService(analysis.searchQuery, {
        limit: 1,
      })),
    };
  }

  // =========================
  // 🛒 CATEGORY BROWSE
  // =========================
  if (isCategoryBrowse) {
    const result = await atlasProductSearchService("", {
      category: analysis.category,
      page: analysis.page,
      limit: 10,
      minPrice: analysis.budget?.min,
      maxPrice: analysis.budget?.max,
    });

    return {
      type: "category",
      message: `Browsing category 🛒`,
      ...result,
    };
  }

  // =========================
  // 🔍 DEFAULT PRODUCT SEARCH
  // =========================
  const result = await atlasProductSearchService(
    analysis.searchQuery,
    {
      page: analysis.page,
      limit: 10,
      category:
        analysis.category !== "other"
          ? analysis.category
          : undefined,
      brand:
        analysis.brand !== "other"
          ? analysis.brand
          : undefined,
      minPrice: analysis.budget?.min,
      maxPrice: analysis.budget?.max,
    }
  );

  if (!result.data.length) {
    return {
      type: "text",
      message: `Sorry 😔 I couldn't find any products for "${analysis.searchQuery}".`,
      products: [],
    };
  }

  return {
    type: "products",
    message: `Found ${result.meta.total} products 🛒`,
    ...result,
  };
};

// ======================================================
// PRODUCT DETAILS
// ======================================================

export const getProductDetailsByChatBot = async (analysis: any) => {
  const searchTerm = analysis.searchQuery?.trim();

  let product: any = null;

  // =========================
  // 🔍 ATLAS SEARCH (FAST)
  // =========================
  if (searchTerm) {
    const result = await Product.aggregate([
      {
        $search: {
          index: "product_search_index",
          text: {
            query: searchTerm,
            path: "name",
            fuzzy: { maxEdits: 1 },
          },
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "stocks",
          localField: "stock",
          foreignField: "_id",
          as: "stock",
        },
      },
      { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
    ]);

    product = result[0];
  }

  // =========================
  // ❌ NOT FOUND
  // =========================
  if (!product) {
    return {
      type: "text",
      message: `Sorry 😔 I couldn't find any product named "${searchTerm}".`,
    };
  }

  // =========================
  // 📦 STOCK
  // =========================
  const stock = product?.stock?.quantity || 0;
  const category = product?.category?.name || "Unknown";

  const stockText =
    stock > 0
      ? `✅ In Stock (${stock} available)`
      : "❌ Out of Stock";

  // =========================
  // 🚀 RESPONSE
  // =========================
  return {
    type: "product_detail",

    message: `
🐟 ${product.name}

💰 Price: ${product.price} BDT
📂 Category: ${category}
📦 ${stockText}

${analysis.recommendationHint || "This product is available in our store."}
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