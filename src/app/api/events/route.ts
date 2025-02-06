import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { guard } from "@/lib/server/middleware/guard";
import { IEvent } from "@/types/event.types";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import Event from "@/mongoose/models/Event";
import sendMail from "@/lib/server/email/sendMail";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import eventSuccessTemplate from "@/lib/server/email/templates/eventSuccessTemplate";
import { getSiteURL } from "@/lib/server/urlGenerator";
import { TEventSearchPagination } from "@/context/EventSearchContext";
import connectDB from "@/lib/server/connectDB";

// create event
export const POST = catchAsync(async (req) => {
  // guard
  const user = await guard(req);

  const formData = await req.formData();
  const data = JSON.parse(formData.get("data") as string);
  const image = formData.get("image") as File;

  // extract data
  const {
    title,
    description,
    location,
    date,
    time,
    duration,
    category,
    format,
    language,
    capacity,
    registrationDeadline,
    contact,
  } = data as IEvent;

  const eventData = {
    title,
    description,
    location,
    date,
    time,
    registrationDeadline,
    duration,
    category,
    format,
    language,
    capacity,
    contact,
    organizer: user._id,
  } as Partial<IEvent>;

  // create event
  const newEvent = await Event.create(eventData);

  // handle image
  if (image?.size > 0) {
    // upload image
    const url = await uploadImage({
      file: image,
      folder: `events/${newEvent._id}/image`,
      width: 700,
    });

    // update event with image
    newEvent.image = url;
    await newEvent.save();
  }

  // send confirmation email
  try {
    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      to: user.email,
      subject: "Event Created Successfully",
      html: eventSuccessTemplate({
        subject: "Event Created Successfully",
        url: `${getSiteURL(req)}/my-hosted-events/${newEvent._id}`,
        event: newEvent,
        req,
      }),
    });
  } catch {}

  // send response
  return new AppResponse(200, "event created successfully", { doc: newEvent });
});

export const GET = catchAsync(async (req) => {
  // Extract query parameters
  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const city = url.searchParams.get("city");
  const state = url.searchParams.get("state");
  const address = url.searchParams.get("address");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const category = url.searchParams.get("category");
  const format = url.searchParams.get("format");
  const language = url.searchParams.get("language");
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "30", 10); // Default limit: 30

  // Build filter object
  const filters: Record<string, any> = {};

  // Search by title or description
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } }, // Case-insensitive search
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Location filters
  if (city) filters["location.city"] = city;
  if (state) filters["location.state"] = state;
  if (address) filters["location.address"] = { $regex: address, $options: "i" };

  // Date range filters
  if (dateFrom || dateTo) {
    filters.date = {};
    if (dateFrom) filters.date.$gte = new Date(dateFrom);
    if (dateTo) filters.date.$lte = new Date(dateTo);
  }

  // Event attributes filters
  if (category) filters.category = category;
  if (format) filters.format = format;
  if (language) filters.language = language;

  // connect database
  await connectDB();

  // Count total matching events (for pagination)
  const total = await Event.countDocuments(filters);
  const totalPages = Math.ceil(total / limit);

  // Fetch paginated results
  const events = await Event.find(filters)
    .skip((page - 1) * limit) // Skip previous pages
    .limit(limit) // Limit per page
    .populate("organizer", "name"); // Populate organizer name

  return new AppResponse(200, "Events fetched successfully", {
    docs: events,
    pagination: {
      total,
      totalPages,
      page,
      limit,
    } as TEventSearchPagination,
  });
});
