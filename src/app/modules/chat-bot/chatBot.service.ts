import { Inbox } from './chatBot.model';
import { groqResponseChatBot } from '../../utils/groqResponseChatbot';
import { normalizeSearchQuery } from '../../utils/normalizeSearchQuery';
import { intentRouter } from './chatBot.intentRouter';
import { generateRagAnswer, retrieveRagSources } from './chatBot.rag';

export const chatService = async (message: string, inboxId?: string) => {
  let inbox;

  // =========================
  // 1. FIND OR CREATE INBOX
  // =========================
  if (!inboxId) {
    inbox = await Inbox.create({
      messages: [],
    });
  } else {
    inbox = await Inbox.findById(inboxId);

    if (!inbox) {
      inbox = await Inbox.create({
        messages: [],
      });
    }
  }

  const recentHistory = inbox.messages
    .slice(-8)
    .map((item: any, index: number) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: item.content,
    }))
    .filter((item: { content?: string }) => Boolean(item.content));

  // =========================
  // 2. AI ANALYSIS + RAG
  // =========================
  const analysis = await groqResponseChatBot(message);

  analysis.searchQuery = normalizeSearchQuery(analysis.searchQuery);

  const [intentResult, ragSources] = await Promise.all([
    intentRouter(analysis),
    retrieveRagSources(message, analysis),
  ]);

  const ragAnswer = await generateRagAnswer(
    message,
    analysis,
    ragSources,
    recentHistory,
  );

  const result = {
    ...intentResult,
    message: ragAnswer.answer || intentResult.message,
    rag: {
      sources: ragAnswer.sources,
    },
  };

  if (ragAnswer.suggestions.length) {
    analysis.suggestions = ragAnswer.suggestions;
  }

  // =========================
  // 3. PUSH USER MESSAGE
  // =========================
  inbox.messages.push({
    content: message,
    type: 'text',
    analysis,
  });
  // =========================
  // 4. PUSH ASSISTANT MESSAGE
  // =========================

  inbox.messages.push({
    content: result.message,
    type: 'type' in result ? result.type : 'text',
    analysis: 'analysis' in result ? result.analysis : analysis,
    rag: result.rag,
  });

  // =========================
  // 5. SAVE INBOX
  // =========================
  await inbox.save();

  // =========================
  // 6. RETURN RESPONSE
  // =========================
  return {
    meta: {
      inboxId: inbox._id,
      analysis,
      rag: {
        sources: ragAnswer.sources,
      },
    },
    data: result,
  };
};
