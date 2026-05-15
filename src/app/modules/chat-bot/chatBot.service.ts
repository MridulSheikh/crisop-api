import { Inbox } from './chatBot.model';
import { groqResponseChatBot } from '../../utils/groqResponseChatbot';
import { normalizeSearchQuery } from '../../utils/normalizeSearchQuery';
import { intentRouter } from './chatBot.intentRouter';

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

  // =========================
  // 2. AI ANALYSIS
  // =========================
   const analysis = await groqResponseChatBot(message);

  analysis.searchQuery = normalizeSearchQuery(analysis.searchQuery);

  const result = await intentRouter(analysis);

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
    content: message,
    type: 'type' in result ? result.type : 'text',
    analysis: 'analysis' in result ? result.analysis : analysis,
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
    },
    data: result,
  };
};
