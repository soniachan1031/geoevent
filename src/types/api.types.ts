import { FilterQuery } from "mongoose";
import { TUserDocument } from "./user.types";

// extended NextApiRequest
export interface IApiRequest extends Request {
  user?: TUserDocument | null;
}

// enum for cookie names
export enum ECookieName {
  AUTH = "authorization",
}

// type for queryParams
export type TQueryParams = {
  page?: string | number;
  limit?: string | number;
  include?: string;
  exclude?: string;
  populate?: string;
  filter?: FilterQuery<any>;
};

// enum for api request methods
export enum EApiRequestMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

// type for pagination
export type TPagination = {
  total: number;
  pages: number;
  page: number;
  limit: number;
};
