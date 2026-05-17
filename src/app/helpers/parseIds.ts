import mongoose from 'mongoose';
export const parseIds = (value?: string) => {
  if (!value || typeof value !== 'string') return [];

  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(id));
};
