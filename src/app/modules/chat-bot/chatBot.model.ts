import { Schema, model } from "mongoose";

// =========================
// Message Schema
// =========================

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "products", "product_detail", "category"],
      default: "text",
    },

    analysis: {
      intent: { type: String, default: null },
      category: { type: String, default: null },
      brand: { type: String, default: null },
      searchQuery: { type: String, default: null },
      summary: { type: String, default: null },
      recommendationHint: { type: String, default: null },
      budget: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      isSingleProductQuery: { type: Boolean, default: false },
      suggestions: {
        type: [String],
        default: [],
      },
    },

    rag: {
      sources: {
        type: [
          {
            id: { type: String, required: true },
            type: { type: String, required: true },
            title: { type: String, required: true },
            content: { type: String, required: true },
            score: { type: Number, default: 0 },
            metadata: { type: Schema.Types.Mixed, default: {} },
          },
        ],
        default: [],
      },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// =========================
// Inbox Schema
// =========================

const inboxSchema = new Schema(
  {
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // inbox createdAt + updatedAt
  }
);

// =========================
// INDEXES (important for chatbot)
// =========================

inboxSchema.index({ user: 1, updatedAt: -1 });
inboxSchema.index({ "messages.analysis.intent": 1 });
inboxSchema.index({ "messages.analysis.category": 1 });

// =========================
// MODEL EXPORT
// =========================

export const Inbox = model("Inbox", inboxSchema);
