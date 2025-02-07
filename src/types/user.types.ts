import { Document } from "mongoose";

// enum for authenticated status
export enum EAuthStatus {
  UNAUTHENTICATED = "unauthenticated",
  AUTHENTICATED = "authenticated",
  ANY = "any",
}

// user roles
export enum EUserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUserPhoto {
  alt: string;
  url: string;
}

// interface for user
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role?: EUserRole;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date | string;
  phone?: number;
  dateOfBirth?: Date | string;
  photo?: IUserPhoto;
  bio?: string;
  disabled?: boolean;
  subscribeToEmails: boolean;
}

// interface of user document from mongoose
export type TUserDocument = IUser & Document;
