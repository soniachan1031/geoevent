import User from "@/mongoose/models/User";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { parseJson } from "@/lib/server/reqParser";
import { guard } from "@/lib/server/middleware/guard";
import sendMail from "@/lib/server/email/sendMail";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import emailSubscriptionTemplate from "@/lib/server/email/templates/emailSubscriptionTemplate";
import AppError from "@/lib/server/AppError";

// update user
export const PATCH = catchAsync(async (req) => {
  // guard
  const user = await guard(req);

  // extract data
  const { subscribeToEmails } = await parseJson(req);

  if (typeof subscribeToEmails !== "boolean") {
    throw new AppError(400, "Invalid value for subscribeToEmails");
  }

  // update user
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        subscribeToEmails,
      },
    },
    { new: true }
  );

  if (!updatedUser) throw new AppError(500, "User not found");

  // send confirmation email
  try {
    const subject = updatedUser.subscribeToEmails
      ? "Subscribed to Emails"
      : "Unsubscribed from Emails";

    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      to: user.email,
      subject,
      html: emailSubscriptionTemplate({
        user: updatedUser,
        req,
      }),
    });
  } catch {}

  // send response
  return new AppResponse(200, "Preferences Updated", { doc: updatedUser });
});
