export interface BudgetRange {
  min: number | null;
  max: number | null;
}

export interface AIAnalysisResponse {
  // 🤖 Intent
  intent:
    | "product_search"
    | "product_detail"
    | "category_browse"
    | "price_filter"
    | "similar_products"
    | "diet_suggestion"
    | "nutrition_info"
    | "fitness_food"
    | "healthy_recommendation"
    | "order_status"
    | "order_cancel"
    | "order_return"
    | "delivery_info"
    | "payment_methods"
    | "coupon_query"
    | "checkout_help"
    | "faq_delivery"
    | "faq_refund"
    | "faq_store_info"
    | "faq_support"
    | "recommendation_request"
    | "trending_products"
    | "personalized_suggestion"
    | "smart_search"
    | "ingredient_search"
    | "brand_search"
    | "greeting"
    | "goodbye"
    | "thanks"
    | "general_question";

  // 🛒 Category
  category: string;

  // 📝 Short explanation
  summary: string;

  // 🔍 Database-ready search keywords
  searchQuery: string;

  // 💡 Why products are recommended
  recommendationHint: string;

  // 💰 Budget filtering
  budget: BudgetRange;

  // 🎯 Exact single product search?
  isSingleProductQuery: boolean;

  suggestions?: string[];
}