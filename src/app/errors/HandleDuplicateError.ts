/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenaricErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenaricErrorResponse => {
  const statusCode = 400;
  return {
    statusCode,
    message: 'Duplicate Error',
    errorMessage: `${
      err.keyValue[Object.keys(err.keyValue)[0]]
    } already exists.`,
    errorDetails: err,
  };
};

export default handleDuplicateError;
