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
import { encryptString } from "@/lib/server/encryptionHandler";
import resetPasswordSuccessTemplate from "@/lib/server/email/templates/resetPasswordSuccessTemplate";

export const POST = catchAsync(async (req) => {
  // get data from body
  const { password, passwordResetToken } = await parseJson(req);

  // check data
  if (!password) throw new AppError(400, "password is required");
  if (!passwordResetToken)
    throw new AppError(400, "password reset token is required");

  // verify token
  const verifiedToken = jwt.verify(passwordResetToken, JWT_SECRET);
  if (!verifiedToken || typeof verifiedToken !== "object" || !verifiedToken.id)
    throw new AppError(400, "invalid password reset token");

  // check if user is already logged in
  await connectDB();
  const loggedInUser = await getUser(
    (await cookies()).get(ECookieName.AUTH)?.value
  );
  if (loggedInUser) throw new AppError(403, "user is already logged in");

  // check if user with id exists
  const user = await User.findById(verifiedToken.id).select(
    "passwordResetToken passwordResetExpires email"
  );
  if (!user) throw new AppError(400, "user not found");

  // check if password reset token is valid
  if (user.passwordResetToken !== passwordResetToken)
    throw new AppError(400, "invalid password reset token");

  // check if password reset token has expired
  if (!user.passwordResetExpires)
    throw new AppError(400, "password reset token expired");
  if (user.passwordResetExpires < new Date())
    throw new AppError(400, "password reset token expired");

  // update password
  const encryptedPassword = await encryptString(password);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: encryptedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    },
    { new: true }
  );

  if (!updatedUser) throw new AppError(500, "failed to update user");

  // send email
  try {
    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      to: user.email,
      subject: "Password Reset Successful",
      html: resetPasswordSuccessTemplate({
        req,
      }),
    });
    // send response
    return new AppResponse(200, "password reset successful");
  } catch {
    throw new AppError(500, "failed to send email");
  }
});
