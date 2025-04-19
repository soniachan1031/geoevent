import connectDB from "@/lib/server/connectDB";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import { guard } from "@/lib/server/middleware/guard";
import { EUserRole } from "@/types/user.types";
import sendMail from "@/lib/server/email/sendMail";
import User from "@/mongoose/models/User";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import templateContainer from "@/lib/server/email/templates/emailBodyTemplateContainer";
import { parseJson } from "@/lib/server/reqParser";

export const POST = catchAsync(async (req) => {
  await connectDB();
  const currentUser = await guard(req);

  if (currentUser.role !== EUserRole.ADMIN) {
    throw new AppError(403, "Only admins can send global emails");
  }

  const { subject, text } = (await parseJson(req)) as {
    subject: string;
    text: string;
  };

  if (!subject || !text) {
    throw new AppError(400, "Missing subject or text");
  }

  const users = await User.find({
    role: { $ne: EUserRole.ADMIN }, // exclude admin
    email: { $ne: null },
  }).select("email");

  const bcc = users.map((u) => u.email).join(",");

  if (!bcc) {
    throw new AppError(400, "No valid user emails found");
  }

  const html = templateContainer({
    title: subject,
    content: `<p>${text}</p>`,
    req,
  });

  await sendMail({
    smtpUserName: MAIL_SMTP_USERNAME,
    smtpPassword: MAIL_SMTP_PASSWORD,
    bcc,
    subject,
    html,
  });

  return new AppResponse(
    200,
    "Global email sent successfully to users (excluding admins)"
  );
});
