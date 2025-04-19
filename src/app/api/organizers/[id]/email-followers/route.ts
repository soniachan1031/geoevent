import { Types } from "mongoose";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import { guard } from "@/lib/server/middleware/guard";
import connectDB from "@/lib/server/connectDB";
import Follower from "@/mongoose/models/Follower";
import User from "@/mongoose/models/User";
import { EUserRole, IUser } from "@/types/user.types";
import sendMail from "@/lib/server/email/sendMail";
import organizerFollowersTemplate from "@/lib/server/email/templates/OrganizerFollowersTemplate";
import { parseJson } from "@/lib/server/reqParser";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";

export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await connectDB();
    const currentUser = await guard(req);
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid organizer ID");
    }

    // Only allow the organizer themself or an admin to send emails
    if (
      currentUser._id.toString() !== id &&
      currentUser.role !== EUserRole.ADMIN
    ) {
      throw new AppError(
        403,
        "You are not authorized to email these followers"
      );
    }

    const organizer = await User.findById(id);
    if (
      !organizer ||
      (organizer.role !== EUserRole.ORGANIZER &&
        organizer.role !== EUserRole.ADMIN)
    ) {
      throw new AppError(404, "Organizer not found");
    }

    const { subject, text } = (await parseJson(req)) as {
      subject: string;
      text: string;
    };

    if (!subject || !text) {
      throw new AppError(400, "Missing required fields");
    }

    const followers = await Follower.find({ organizer: id }).populate<{
      follower: IUser;
    }>({
      path: "follower",
      select: "email",
    });

    const bcc = followers
      .map((f) => f.follower?.email)
      .filter((email) => email)
      .join(",");

    if (!bcc) {
      throw new AppError(400, "No followers with valid emails found");
    }

    const html = organizerFollowersTemplate({
      subject,
      text,
      organizer: currentUser,
      req,
    });

    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      bcc,
      subject,
      html,
    });

    return new AppResponse(200, "Emails sent successfully");
  }
);
