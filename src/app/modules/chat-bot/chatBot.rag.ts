import Groq from 'groq-sdk';
import config from '../../config';
import Product from '../product/product.model';
import Category from '../category/category.model';
import Brand from '../brand/brand.model';
import { AIAnalysisResponse } from './chatBot.interface';

type RagSourceType = 'product' | 'category' | 'brand' | 'store_policy';

export type RagSource = {
  id: string;
  type: RagSourceType;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
};

type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type RagAnswer = {
  answer: string;
  sources: RagSource[];
  suggestions: string[];
};

const groq = new Groq({
  apiKey: config.GROQ_API_KEY,
});

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'ask',
  'at',
  'below',
  'buy',
  'for',
  'from',
  'give',
  'how',
  'i',
  'in',
  'is',
  'me',
  'of',
  'on',
  'or',
  'show',
  'the',
  'to',
  'under',
  'what',
  'with',
]);

const STORE_KNOWLEDGE: Omit<RagSource, 'score'>[] = [
  {
    id: 'store-overview',
    type: 'store_policy',
    title: 'Crisop store overview',
    content:
      'Crisop is a grocery ecommerce store for fresh groceries, fish, meat, vegetables, fruits, healthy foods, and daily essentials.',
  },
  {
    id: 'delivery-info',
    type: 'store_policy',
    title: 'Delivery information',
    content:
      'Crisop helps customers order groceries online and receive delivery. For exact delivery time, area coverage, and fees, customers should check checkout details or contact support.',
  },
  {
    id: 'payment-info',
    type: 'store_policy',
    title: 'Payment information',
    content:
      'Crisop supports online checkout. Available payment options can depend on checkout configuration, including card payments when Stripe is enabled.',
  },
  {
    id: 'shopping-help',
    type: 'store_policy',
    title: 'Shopping help',
    content:
      'Customers can ask Crisop AI to search products, browse categories, compare prices, check stock, find healthy groceries, and get product recommendations.',
  },
  {
    id: 'support-info',
    type: 'store_policy',
    title: 'Support information',
    content:
      'For order-specific problems, refunds, returns, cancellations, or account issues, customers should contact Crisop support or use the relevant order page.',
  },
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const scoreDocument = (queryTokens: string[], document: Omit<RagSource, 'score'>) => {
  const searchable = `${document.title} ${document.content}`.toLowerCase();

  return queryTokens.reduce((score, token) => {
    if (searchable.includes(token)) {
      return score + (document.title.toLowerCase().includes(token) ? 3 : 1);
    }

    return score;
  }, 0);
};

const buildProductFilter = (analysis: AIAnalysisResponse) => {
  const filter: Record<string, unknown> = {
    isDeleted: { $ne: true },
    isPublished: { $ne: false },
  };

  if (analysis.category && analysis.category !== 'other') {
    filter.category = analysis.category;
  }

  if (analysis.brand && analysis.brand !== 'other') {
    filter.brand = analysis.brand;
  }

  if (analysis.budget?.min || analysis.budget?.max) {
    const price: Record<string, number> = {};

    if (analysis.budget.min) {
      price.$gte = analysis.budget.min;
    }

    if (analysis.budget.max) {
      price.$lte = analysis.budget.max;
    }

    filter.price = price;
  }

  return filter;
};

const retrieveProductSources = async (
  message: string,
  analysis: AIAnalysisResponse,
) => {
  const searchTerm = analysis.searchQuery?.trim() || message.trim();
  const filter = buildProductFilter(analysis);
  const regex = new RegExp(escapeRegExp(searchTerm), 'i');

  const products = await Product.find(
    searchTerm
      ? {
          ...filter,
          $or: [{ name: regex }, { description: regex }, { tags: regex }],
        }
      : filter,
  )
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('stock', 'quantity unit')
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(30)
    .lean();

  return products.map((product: any) => {
    const price = product.discountPrice || product.price;
    const stockQuantity = product.stock?.quantity ?? 0;
    const category = product.category?.name || 'Unknown category';
    const brand = product.brand?.name || 'Unknown brand';
    const tags = Array.isArray(product.tags) ? product.tags.join(', ') : '';

    return {
      id: String(product._id),
      type: 'product' as const,
      title: product.name,
      content: [
        `Product: ${product.name}`,
        `Category: ${category}`,
        `Brand: ${brand}`,
        `Price: ${price} BDT`,
        `Original price: ${product.price} BDT`,
        product.discountPrice ? `Discount price: ${product.discountPrice} BDT` : '',
        `Stock: ${stockQuantity > 0 ? `${stockQuantity} available` : 'out of stock'}`,
        tags ? `Tags: ${tags}` : '',
        product.description ? `Description: ${product.description}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      metadata: {
        productId: String(product._id),
        price,
        stockQuantity,
        category,
        brand,
      },
    };
  });
};

const retrieveCatalogSources = async () => {
  const [categories, brands] = await Promise.all([
    Category.find({ isDeleted: { $ne: true } }).limit(50).lean(),
    Brand.find({ isDeleted: { $ne: true } }).limit(50).lean(),
  ]);

  const categorySources = categories.map((category) => ({
    id: String(category._id),
    type: 'category' as const,
    title: category.name,
    content: `Category: ${category.name}\n${category.description || ''}`,
  }));

  const brandSources = brands.map((brand) => ({
    id: String(brand._id),
    type: 'brand' as const,
    title: brand.name,
    content: `Brand: ${brand.name}`,
  }));

  return [...categorySources, ...brandSources];
};

export const retrieveRagSources = async (
  message: string,
  analysis: AIAnalysisResponse,
) => {
  const queryTokens = tokenize(`${message} ${analysis.searchQuery || ''}`);
  const [productSources, catalogSources] = await Promise.all([
    retrieveProductSources(message, analysis),
    retrieveCatalogSources(),
  ]);

  const allSources = [
    ...productSources,
    ...catalogSources,
    ...STORE_KNOWLEDGE,
  ];

  return allSources
    .map((source) => ({
      ...source,
      score: scoreDocument(queryTokens, source),
    }))
    .filter((source) => source.score > 0 || source.type === 'product')
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

const buildContext = (sources: RagSource[]) =>
  sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.type.toUpperCase()}: ${source.title}\n${source.content}`,
    )
    .join('\n\n');

export const generateRagAnswer = async (
  message: string,
  analysis: AIAnalysisResponse,
  sources: RagSource[],
  history: ChatHistoryMessage[],
): Promise<RagAnswer> => {
  if (!sources.length) {
    return {
      answer:
        "I could not find enough Crisop catalog information for that. Try asking about a product, category, delivery, payment, or healthy grocery suggestion.",
      sources: [],
      suggestions: ['Fresh fish', 'Vegetables', 'Delivery info'],
    };
  }

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are Crisop AI, a helpful grocery ecommerce assistant.

Answer only from the provided RAG context. If the context is insufficient, say what is missing and suggest a useful next question.
Keep answers concise, friendly, and practical.
Use BDT for prices.
Do not invent stock, delivery time, refund policy, discounts, product IDs, or payment methods.

Return strict JSON only:
{
  "answer": "customer-facing answer",
  "suggestions": ["2-5 word suggestion"]
}`,
      },
      {
        role: 'user',
        content: `Conversation history:
${history.map((item) => `${item.role}: ${item.content}`).join('\n') || 'No previous messages'}

Intent analysis:
${JSON.stringify(analysis)}

RAG context:
${buildContext(sources)}

Customer question:
${message}`,
      },
    ],
    temperature: 0.25,
    response_format: {
      type: 'json_object',
    },
  });

  try {
    const parsed = JSON.parse(res.choices[0]?.message?.content || '{}');

    return {
      answer:
        typeof parsed.answer === 'string' && parsed.answer.trim()
          ? parsed.answer.trim()
          : 'I found relevant Crisop information, but could not format the answer clearly.',
      sources,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((item: unknown) => typeof item === 'string').slice(0, 5)
        : [],
    };
  } catch {
    return {
      answer:
        'I found relevant Crisop information, but could not format the answer clearly.',
      sources,
      suggestions: analysis.suggestions || [],
    };
  }
};
