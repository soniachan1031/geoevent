import connectDB from "@/lib/server/connectDB";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import { parseJson } from "@/lib/server/reqParser";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import Event from "@/mongoose/models/Event";
import EventRegistration from "@/mongoose/models/EventRegistration";
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import templateContainer from "@/lib/server/email/templates/emailBodyTemplateContainer";
import { EUserRole } from "@/types/user.types";

export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await connectDB();
    const currentUser = await guard(req);
    const { id: eventId } = await params;

    if (!eventId) {
      throw new AppError(400, "Event ID is required");
    }

    const event = await Event.findById(eventId).populate(
      "organizer",
      "_id email name"
    );

    if (!event) {
      throw new AppError(404, "Event not found");
    }

    const isOrganizer =
      typeof event.organizer === "object" &&
      event.organizer._id.toString() === currentUser._id;
    const isAdmin = currentUser.role === EUserRole.ADMIN;

    if (!isOrganizer && !isAdmin) {
      throw new AppError(
        403,
        "You are not authorized to send emails for this event"
      );
    }

    const { subject, text } = (await parseJson(req)) as {
      subject: string;
      text: string;
    };

    if (!subject || !text) {
      throw new AppError(400, "Subject and message text are required");
    }

    // Get user IDs from EventRegistration model
    const registrations = await EventRegistration.find({
      event: eventId,
    }).select("user");

    const userIds = registrations.map((reg) => reg.user);

    if (userIds.length === 0) {
      throw new AppError(400, "No registered users for this event");
    }

    // Fetch valid users with emails
    const users = await User.find({
      _id: { $in: userIds },
      email: { $ne: null },
    }).select("email");

    const bcc = users.map((u) => u.email).join(",");

    if (!bcc) {
      throw new AppError(
        400,
        "No valid email addresses found among participants"
      );
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
      "Email sent successfully to all registered participants"
    );
  }
);
