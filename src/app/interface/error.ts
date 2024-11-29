/* eslint-disable @typescript-eslint/no-explicit-any */
export type TZodErrorDetails = {
  path: string | number;
  message: string;
}[];

export type TGenaricErrorResponse = {
  statusCode: number;
  message: string;
  errorMessage: string;
  errorDetails: any;
};
