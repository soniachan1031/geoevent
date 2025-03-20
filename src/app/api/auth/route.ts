import User from "@/mongoose/models/User";
import { IUser } from "@/types/user.types";
import AppError from "@/lib/server/AppError";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import { guard } from "@/lib/server/middleware/guard";
import isEmail from "@/lib/isEmail";
import { verifyEncryptedString } from "@/lib/server/encryptionHandler";
import AppResponse from "@/lib/server/AppResponse";
import { parseJson } from "@/lib/server/reqParser";
import { removeAuthCookie, setAuthCookie } from "@/lib/server/cookieHandler";

// login user
export const POST = catchAsync(async (req) => {
  // get data from body
  const { email, password } = await parseJson(req);

  // check data
  if (!email) throw new AppError(400, "email is required");
  if (!isEmail(email)) throw new AppError(400, "not a valid email");
  if (!password) throw new AppError(400, "password is required");

  // connect to database
  await connectDB();

  // // check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError(404, "user not found");

  // check if user is disabled
  if (user.disabled) throw new AppError(401, "unauthorized");

  // // verify password
  const passwordVerified = await verifyEncryptedString(
    password,
    user.password as string
  );

  // // if not verified, remove auth cookie and throw error
  if (!passwordVerified) {
    await removeAuthCookie();
    throw new AppError(401, "invalid credentials");
  }

  // // set auth cookie with user's id
  await setAuthCookie(user._id.toString());

  // // remove password for safety
  const userData: IUser = user;
  userData.password = undefined;

  // // send response
  return new AppResponse(200, "login successful", { doc: userData });
});

// logout user
export const DELETE = catchAsync(async (req) => {
  // guard
  await guard(req);

  // remove auth cookie
  removeAuthCookie();

  // send response
  return new AppResponse(200, "logout successful");
});
