import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import User from '../user/user.model';
import {
  intentRouter,
  intentRoutingResponse,
} from './intentRouter/intentRouter.services';
import Inbox from './chat.model';

const chatBotService = async (
  message: string,
  email: string,
  inboxId?: string,
) => {
  // chek inbox id
  const inbox = await Inbox.findById(inboxId);

  if (!inbox) {
    // check if user exist or not
    const isUserExists = await User.isUserExsitsByUserEmail(email);

    if (!isUserExists) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Please provide a valid user email',
      );
    }

    
  }

  const intent = await intentRoutingResponse(message);

  const result = await intentRouter(intent as string, message, email);

  return result;
};

export const chatService = { chatBotService };
