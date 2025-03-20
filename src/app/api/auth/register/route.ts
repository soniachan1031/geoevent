import User from "@/mongoose/models/User";
import AppError from "@/lib/server/AppError";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import isEmail from "@/lib/isEmail";
import AppResponse from "@/lib/server/AppResponse";
import { parseJson } from "@/lib/server/reqParser";
import { setAuthCookie } from "@/lib/server/cookieHandler";
import { EUserRole, IUser } from "@/types/user.types";
import sendMail from "@/lib/server/email/sendMail";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import registrationSuccessTemplate from "@/lib/server/email/templates/registrationSuccessTemplate";

// register user
export const POST = catchAsync(async (req) => {
  // get data from body
  const { name, email, password, confirmPassword } = await parseJson(req);

  // check data
  if (!name) throw new AppError(400, "name is required");
  if (!email) throw new AppError(400, "email is required");
  if (!isEmail(email)) throw new AppError(400, "not a valid email");
  if (!password) throw new AppError(400, "password is required");
  if (!confirmPassword) throw new AppError(400, "confirm password is required");
  if (password !== confirmPassword)
    throw new AppError(400, "passwords don't match");

  // connect to database
  await connectDB();

  // // check if user already exists
  const user = await User.findOne({ email }).select("+password");
  if (user) throw new AppError(404, "user with email already exists");

  // // create user
  const newUser = await User.create({
    name,
    email,
    password,
    role: EUserRole.USER,
  });

  // // set auth cookie with user's id
  await setAuthCookie(newUser._id.toString());

  // // remove password for safety
  const userData: IUser = newUser;
  userData.password = undefined;

  // send confirmation email
  try {
    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      to: email,
      subject: "Registration Successful",
      html: registrationSuccessTemplate({
        user: userData,
        req,
      }),
    });
  } catch {}

  // // send response
  return new AppResponse(200, "registration successful", { doc: userData });
});
