import { Response } from 'express';

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const preResponse: TResponse<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  };
  if (data.meta) {
    preResponse.meta = data.meta;
  }
  res.status(data?.statusCode).json(preResponse);
};

export default sendResponse;
