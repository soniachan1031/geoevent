import User from "@/mongoose/models/User";
import connectDB from "./connectDB";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../credentials";
import { TUserDocument } from "@/types/user.types";

/**
 * get authenticated user
 * @param  authCookie - The auth cookie string.
 * @returns The authenticated user (mongoose document) or null if not authenticated
 */
export const getUser = async (
  authCookie: string | undefined,
  withPassword: boolean = false
): Promise<TUserDocument | null> => {
  try {
    // check auth cookie
    if (!authCookie) return null;

    let docId: string;
    // verify auth cookie
    try {
      docId = jwt.verify(authCookie, JWT_SECRET) as string;
    } catch {
      return null;
    }

    if (!docId) return null;
    // connect to database
    await connectDB();

    // get user
    const user = withPassword
      ? await User.findById(docId).select("+password")
      : await User.findById(docId);

    if (!user) return null;

    // return user
    return user;
  } catch {
    return null;
  }
};

export default getUser;
