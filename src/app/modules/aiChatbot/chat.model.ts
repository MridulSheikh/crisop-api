import { Schema, model, Document } from 'mongoose';
import { Ichats } from './chat.interface';

// 1. TypeScript Interfaces (Apnar dewa interfaces)


export interface TInbox {
  userEmail: string;
  chat: Ichats[];
}

interface IInboxDocument extends TInbox, Document {}

// 2. Chat Sub-document Schema
const ChatSchema = new Schema<Ichats>({
  type: { 
    type: String, 
    enum: ["user", "bot"], 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  intent:{
    type: String,
    required: true,
    enum:['PRODUCT_DETAILS','ORDER_DETAILS','GENERAL_QA']
  }
});

// 3. Main Inbox Schema
const InboxSchema = new Schema<IInboxDocument>({
  userEmail: { 
    type: String, 
    required: true,
    unique: true
  },
  chat: [ChatSchema] 
}, {
  timestamps: true 
});

// 4. Create Model
const Inbox = model<IInboxDocument>('Inbox', InboxSchema);

export default Inbox;