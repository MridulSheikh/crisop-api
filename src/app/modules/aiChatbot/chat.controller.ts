import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { chatService } from './chat.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

export const chatbotController = catchAsync(async (req: Request, res: Response) => {
  const { message, inboxId } = req.body;
  const {email} = req.user;
  const result = await chatService.chatBotService(message, email, inboxId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully generate response',
    data: result,
  });
});