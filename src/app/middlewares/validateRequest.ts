import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';
import config from '../config';


const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (config.NODE_ENV === 'development') {
      const mappedBody = Object.entries(req.body).map(([key, value]) => ({
        Field: key,
        Value: value,
      }));
      console.table(mappedBody)
    }
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    return next();
  });
};

export default validateRequest;
