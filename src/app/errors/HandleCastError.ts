import mongoose from 'mongoose';
import { TGenaricErrorResponse } from '../interface/error';

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenaricErrorResponse => {
  const errorMessage = `${err.value} is not a valid ID!`;
  const errorDetails = {
    stringValue: JSON.parse(err.stringValue),
    valueType: typeof err.value,
    kind: 'ObjectId',
    value: err.value,
    path: err.path,
    reason: {},
    name: err.name,
    message: `Cast to ObjectId failed for value '${
      err.value
    }' (type ${typeof err.value}) at path '${err.path}' for model '${
      err.model.modelName
    }'`,
  };
  const statusCode = 500;
  return {
    statusCode,
    message: 'Invalid ID',
    errorMessage,
    errorDetails,
  };
};

export default handleCastError;
