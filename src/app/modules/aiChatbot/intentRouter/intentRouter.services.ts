import { generalQuestion, orderAssistent, productDetailsAssistent } from './intent.assistent';
import { groq, groqAiModel } from '../../../config/groq';

export const intentRouter = async (intent: string, userPrompt: string, userEmail: string) => {
  switch (intent) {
    case 'PRODUCT_DETAILS':
      return productDetailsAssistent(userPrompt);

    case 'ORDER_DETAILS':
      return orderAssistent(userPrompt, userEmail);

    case 'GENERAL_QA':
      return generalQuestion(userPrompt);

    default:
      return {
        intentResponse: 'Sorry, I could not understand your request.',
      };
  }
};

export const intentRoutingResponse = async (prompt: string) => {
  const routingResponse = await groq.chat.completions.create({
    model: groqAiModel,

    messages: [
      {
        role: 'system',
        content: `
You are an e-commerce intent classifier.

Classify the user message into exactly one:

PRODUCT_DETAILS:
User wants to search, browse, view, discover, list, or get information about products.

Examples:
"show me some fish"
"show me all phones"
"find laptops"
"give me available products"
"product price"


ORDER_DETAILS:
User asks about an existing order.

Examples:
"where is my order"
"track my order"
"cancel my order"


GENERAL_QA:
General questions or non-shopping conversations.

Examples:
"what is fish"
"how does payment work"
"hello"


Return only JSON:

{
 "intent":"PRODUCT_DETAILS"
}
        `,
      },

      {
        role: 'user',
        content: prompt,
      },
    ],

    temperature: 0,
  });

  const result = JSON.parse(
    routingResponse.choices[0].message.content as string,
  );

  return result.intent;
};
