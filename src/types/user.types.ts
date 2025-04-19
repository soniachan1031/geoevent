import { Document, Types } from "mongoose";
import { EEventCategory } from "./event.types";

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
  ORGANIZER = "organizer",
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
  interestedCategories?: EEventCategory[];
}

// interface of user document from mongoose
export type TUserDocument = IUser & Document;

export interface IFollower {
  follower: Types.ObjectId; // the user who is following
  organizer: Types.ObjectId; // the organizer being followed
  followedAt: Date;
}
