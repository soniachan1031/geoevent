import isEmail from "@/lib/isEmail";
import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import sendMail from "@/lib/server/email/sendMail";
import getUser from "@/lib/server/getUser";
import { parseJson } from "@/lib/server/reqParser";
import User from "@/mongoose/models/User";
import { ECookieName } from "@/types/api.types";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  MAIL_SMTP_PASSWORD,
  MAIL_SMTP_USERNAME,
} from "@/lib/credentials";
import { getSiteURL } from "@/lib/server/urlGenerator";
import resetPasswordTemplate from "@/lib/server/email/templates/resetPasswordTemplate";

export const POST = catchAsync(async (req) => {
  // get data from body
  const { email } = await parseJson(req);

  // check data
  if (!email) throw new AppError(400, "email is required");
  if (!isEmail(email)) throw new AppError(400, "not a valid email");

  await connectDB();

  // check if user is already logged in
  const loggedInUser = await getUser(
    (await cookies()).get(ECookieName.AUTH)?.value
  );
  if (loggedInUser) throw new AppError(403, "user is already logged in");

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) throw new AppError(400, "user not found");

  // generate token
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  // save token to database
  await User.findByIdAndUpdate(user._id, {
    $set: {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // generate password reset url
  const siteUrl = getSiteURL(req);
  const passwordResetUrl = `${siteUrl}/reset-password?token=${token}`;

  // send email
  try {
    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      to: email,
      subject: "Password Reset",
      html: resetPasswordTemplate({
        passwordResetUrl,
        req,
      }),
    });

    // send response
    return new AppResponse(200, "password reset link sent to your email");
  } catch {
    return new AppError(500, "failed to send password reset link");
  }
});
