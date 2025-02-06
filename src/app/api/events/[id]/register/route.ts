import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import sendMail from "@/lib/server/email/sendMail";
import eventSuccessTemplate from "@/lib/server/email/templates/eventSuccessTemplate";
import { guard } from "@/lib/server/middleware/guard";
import { getSiteURL } from "@/lib/server/urlGenerator";
import Event from "@/mongoose/models/Event";
import EventRegistration from "@/mongoose/models/EventRegistration";

// Register for an event (upsert)
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // Extract event ID from params
    const { id } = await params;

    // Authenticate user
    const user = await guard(req);

    // Check if the event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "Event not found");
    }

    // check if event date has passed
    if (event.date < new Date()) {
      throw new AppError(400, "Event date has passed");
    }

    // check if registration deadline has passed
    if (event.registrationDeadline && event.registrationDeadline < new Date()) {
      throw new AppError(400, "Registration deadline has passed");
    }

    // check if user is the organizer
    if (String(event.organizer) === user._id.toString()) {
      throw new AppError(400, "Organizer cannot register for event");
    }

    // check if already registered
    const existingRegistration = await EventRegistration.findOne({
      event: id,
      user: user._id,
    });

    if (existingRegistration) {
      throw new AppError(400, "Already registered for event");
    }

    // register for event
    const eventRegistration = await EventRegistration.create({
      event: id,
      user: user._id,
    });

    // send confirmation email
    try {
      await sendMail({
        smtpUserName: MAIL_SMTP_USERNAME,
        smtpPassword: MAIL_SMTP_PASSWORD,
        to: user.email,
        subject: "Registered for event Successfully",
        html: eventSuccessTemplate({
          subject: "Registered for event Successfully",
          url: `${getSiteURL(req)}/events/${event._id}`,
          event,
          req,
        }),
      });
    } catch {}

    return new AppResponse(200, "Event registration successful", {
      doc: eventRegistration,
    });
  }
);

// Unregister from an event
export const DELETE = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // Extract event ID from params
    const { id } = await params;

    // Authenticate user
    const user = await guard(req);

    // Remove event registration
    const deletedRegistration = await EventRegistration.findOneAndDelete({
      event: id,
      user: user._id,
    });

    if (!deletedRegistration) {
      throw new AppError(400, "Not registered for event");
    }

    return new AppResponse(200, "Event unregistration successful");
  }
);
