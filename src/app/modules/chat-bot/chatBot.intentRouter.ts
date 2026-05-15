import { AIAnalysisResponse } from "./chatBot.interface";
import { getProductDetailsByChatBot, handleCategoryBrowseByChatBot, handleProductSearchByChatBot } from "./chatBot.handlers";


const intentHandlers = {
  product_search: handleProductSearchByChatBot,
  category_browse: handleCategoryBrowseByChatBot,
  product_detail: getProductDetailsByChatBot
};

export const handleGeneralResponse = async (
  analysis: AIAnalysisResponse
) => {
  const intentResponses: Record<string, string> = {
    greeting:
      `Hello 👋 Welcome to Crisop! How can I help you today?`,

    goodbye:
      "Goodbye 👋 Have a great day and enjoy shopping with Crisop!",

    thanks:
      "You're welcome 😊 Let me know if you need anything else.",

    general_question:
      "I can help you with grocery products, healthy food suggestions, orders, delivery, and recommendations.",
  };

  return {
    type: "text",
    intent: analysis.intent,
    message:
      intentResponses[analysis.intent] ||
      "I'm here to help you with your grocery shopping needs.",
  };
};

export const intentRouter = async (analysis: AIAnalysisResponse) => {
  const handler = intentHandlers[analysis.intent as keyof typeof intentHandlers];

  if (!handler) {
    return handleGeneralResponse(analysis);
  }

  return handler(analysis);
};