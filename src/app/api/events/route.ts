import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { guard } from "@/lib/server/middleware/guard";
import { IEvent } from "@/types/event.types";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import Event from "@/mongoose/models/Event";
import sendMail from "@/lib/server/email/sendMail";
import {
  MAIL_SMTP_PASSWORD,
  MAIL_SMTP_USERNAME,
  TICKETMASTER_API_KEY,
} from "@/lib/credentials";
import eventSuccessTemplate from "@/lib/server/email/templates/eventSuccessTemplate";
import { getSiteURL } from "@/lib/server/urlGenerator";
import connectDB from "@/lib/server/connectDB";
import { ECookieName, TPagination } from "@/types/api.types";
import { Types } from "mongoose";
import { ticketMasterToLocalEvent } from "@/lib/externalToLocalEventHandler";
import AppError from "@/lib/server/AppError";
import { EUserRole, IUser } from "@/types/user.types";
import Follower from "@/mongoose/models/Follower";
import organizerFollowersTemplate from "@/lib/server/email/templates/OrganizerFollowersTemplate";
import getUser from "@/lib/server/getUser";
import { cookies } from "next/headers";
import { categoryToClassificationMap } from "@/lib/ticketMaster/ticketMasterDictionary";

// create event
export const POST = catchAsync(async (req) => {
  // guard
  const user = await guard(req);

  // check if admin or organizer
  if (user.role !== EUserRole.ADMIN && user.role !== EUserRole.ORGANIZER) {
    throw new AppError(403, "forbidden");
  }

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
        url: `${getSiteURL(req)}/events/${newEvent._id}`,
        event: newEvent,
        user,
        req,
      }),
    });
  } catch {}

  // send email to followers
  try {
    const followers = await Follower.find({ organizer: user._id }).populate<{
      follower: IUser;
    }>({
      path: "follower",
      select: "email",
    });

    const bcc = followers
      .map((f) => f.follower?.email)
      .filter((email) => email)
      .join(",");

    if (!bcc) return;

    const subject = `New Event: ${newEvent.title}`;
    const text = `A new event has been created: ${newEvent.title}`;

    const html = organizerFollowersTemplate({
      subject,
      text,
      organizer: user,
      event: newEvent,
      req,
    });

    await sendMail({
      smtpUserName: MAIL_SMTP_USERNAME,
      smtpPassword: MAIL_SMTP_PASSWORD,
      bcc,
      subject,
      html,
    });
  } catch {}

  // send response
  return new AppResponse(200, "event created successfully", { doc: newEvent });
});

// GET /api/events
export const GET = catchAsync(async (req) => {
  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const city = url.searchParams.get("city");
  const state = url.searchParams.get("state");
  const country = url.searchParams.get("country");
  const address = url.searchParams.get("address");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const category = url.searchParams.get("category");
  const format = url.searchParams.get("format");
  const language = url.searchParams.get("language");
  const ticketMaster = url.searchParams.get("ticketMaster");

  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "30", 10);

  await connectDB();

  // Optional user
  const cookieValue = (await cookies()).get(ECookieName.AUTH)?.value;
  const user = await getUser(cookieValue).catch(() => null);

  // Initial filters
  const buildFilters = (
    useInterestedCategories = false
  ): Record<string, any> => {
    const filters: Record<string, any> = {};

    if (search) {
      if (Types.ObjectId.isValid(search)) filters._id = search;
      else filters.title = { $regex: search, $options: "i" };
    }

    if (city) filters["location.city"] = { $regex: city, $options: "i" };
    if (state) filters["location.state"] = { $regex: state, $options: "i" };
    if (country)
      filters["location.country"] = { $regex: country, $options: "i" };
    if (address)
      filters["location.address"] = { $regex: address, $options: "i" };

    if (dateFrom || dateTo) {
      filters.date = {};
      if (dateFrom) filters.date.$gte = new Date(dateFrom);
      if (dateTo) filters.date.$lte = new Date(dateTo);
    }

    if (format) filters.format = format;
    if (language) filters.language = language;

    if (category) {
      filters.category = category;
    } else if (useInterestedCategories && user?.interestedCategories?.length) {
      filters.category = { $in: user.interestedCategories };
    }

    return filters;
  };

  let filters = buildFilters(true);

  // Initial local query
  let localEvents = await Event.find(filters)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("organizer", "name");

  let localTotal = await Event.countDocuments(filters);

  // Fallback: If no results and using interestedCategories
  if (!category && user?.interestedCategories?.length && localTotal === 0) {
    filters = buildFilters(false); // Remove interested category filtering

    localEvents = await Event.find(filters)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizer", "name");

    localTotal = await Event.countDocuments(filters);
  }

  const localMapped: IEvent[] = localEvents.map((e) => ({
    _id: e._id.toString(),
    title: e.title,
    description: e.description ?? "",
    location: e.location,
    date: e.date ?? "",
    time: e.time,
    duration: e.duration,
    category: e.category,
    format: e.format,
    language: e.language,
    capacity: e.capacity,
    registrationDeadline: e.registrationDeadline ?? undefined,
    image: e.image,
    agenda: e.agenda || [],
    contact: e.contact,
    organizer: e.organizer,
    external: false,
    url: undefined,
  }));

  // External Events
  const localCount = localMapped.length;
  const externalLimit = limit - localCount > 0 ? limit - localCount : 0;

  let externalTotal = 0;
  let externalMapped: IEvent[] = [];

  if (TICKETMASTER_API_KEY && ticketMaster !== "false" && externalLimit > 0) {
    const tmUrl = new URL(
      "https://app.ticketmaster.com/discovery/v2/events.json"
    );
    tmUrl.searchParams.set("apikey", TICKETMASTER_API_KEY);

    // Determine classification names based on user interests
    let classificationNames: string[] = [];

    if (!category && user?.interestedCategories?.length) {
      classificationNames = user.interestedCategories
        .map((cat) => categoryToClassificationMap[cat])
        .filter(Boolean);
    } else if (category) {
      const mappedClassification = categoryToClassificationMap[category];
      if (mappedClassification) {
        classificationNames = [mappedClassification];
      }
    }

    if (classificationNames.length > 0) {
      tmUrl.searchParams.set(
        "classificationName",
        classificationNames.join(",")
      );
    }

    if (search) tmUrl.searchParams.set("keyword", search);
    if (city) tmUrl.searchParams.set("city", city);
    tmUrl.searchParams.set("countryCode", "CA");
    tmUrl.searchParams.set("sort", "date,asc");
    tmUrl.searchParams.set("page", (page - 1).toString());
    tmUrl.searchParams.set("size", externalLimit.toString());

    const tmRes = await fetch(tmUrl.toString());
    const tmData = await tmRes.json();

    if (tmData.page) externalTotal = tmData.page.totalElements ?? 0;

    if (tmData._embedded?.events) {
      externalMapped = tmData._embedded.events.map(
        (ev: any): IEvent => ticketMasterToLocalEvent(ev)
      );
    }
  }

  const combinedDocs: IEvent[] = [...localMapped, ...externalMapped];
  const combinedTotal = localTotal + externalTotal;
  const combinedPages = Math.ceil(combinedTotal / limit);

  return new AppResponse(200, "Events fetched successfully", {
    docs: combinedDocs,
    pagination: {
      total: combinedTotal,
      pages: combinedPages,
      page,
      limit,
    } as TPagination,
  });
});
