export interface Ichats{
  type: "user" | "bot",
  body: string,
  intent: 'PRODUCT_DETAILS' | 'ORDER_DETAILS' | 'GENERAL_QA'
}


export interface TInbox {
  userId: string;
  chat: Ichats[];
}