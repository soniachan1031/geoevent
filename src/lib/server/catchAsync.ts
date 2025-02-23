import AppError from "./AppError";
import { MongooseError } from "mongoose";
import AppResponse from "./AppResponse";
import { IApiRequest } from "@/types/api.types";

/**
 * higher order error handling function for nextjs api handlers
 *
 * @param fn - The function to be wrapped with error handling.
 * @returns - A promise that resolves when the wrapped function completes successfully, or rejects with an api response.
 */
const catchAsync = <T>(
  fn: (req: IApiRequest, ...args: T[]) => Promise<any>
) => {
  return async (req: IApiRequest, ...args: T[]) => {
    try {
      return await fn(req, ...args);
    } catch (err: any) {
      // default error response
      let statusCode = 500;
      let errorMessage = "Internal Server Error";

      // handle errors
      if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorMessage = err.message;
      } else if (err instanceof MongooseError) {
        statusCode = 400;
        errorMessage = err.message;
      } else {
        console.error("Unexpected error:", err);
      }

      // send error response
      return new AppResponse(statusCode, errorMessage);
    }
  };
};

export default catchAsync;
