import { ZodError, ZodIssue } from 'zod';
import { TGenaricErrorResponse } from '../interface/error';

const handleZodError = (err: ZodError): TGenaricErrorResponse => {
  const errorDetails = {
    issues: err.issues,
    name: 'ZodError',
  };
  let errorMessage = '';
  err.issues.forEach((issue: ZodIssue) => {
    errorMessage = (
      errorMessage +
      issue.path[issue.path.length - 1] +
      ' is ' +
      issue.message +
      '. '
    ).toLocaleLowerCase();
  });
  const statusCode = 500;
  errorMessage = errorMessage.substring(0, errorMessage.length - 1);
  return {
    statusCode,
    message: 'Validation Error',
    errorMessage,
    errorDetails,
  };
};

export default handleZodError;
