import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { guard } from "@/lib/server/middleware/guard";
import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";
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
import { TPagination } from "@/types/api.types";
import { Types } from "mongoose";

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

// GET /api/events
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

  // We'll unify these for local + external
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "30", 10);

  // -------------------------
  // 1) Build Local Filters
  // -------------------------
  const filters: Record<string, any> = {};

  // If 'search' is an ObjectId, assume _id
  if (search) {
    if (Types.ObjectId.isValid(search)) {
      filters._id = search;
    } else {
      filters.title = { $regex: search, $options: "i" };
    }
  }

  if (city) filters["location.city"] = city;
  if (state) filters["location.state"] = state;
  if (address) filters["location.address"] = { $regex: address, $options: "i" };

  if (dateFrom || dateTo) {
    filters.date = {};
    if (dateFrom) filters.date.$gte = new Date(dateFrom);
    if (dateTo) filters.date.$lte = new Date(dateTo);
  }

  if (category) filters.category = category;
  if (format) filters.format = format;
  if (language) filters.language = language;

  // Connect DB
  await connectDB();

  // -------------------------
  // 2) Query Local Events
  // -------------------------
  const localTotal = await Event.countDocuments(filters);
  const localEvents = await Event.find(filters)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("organizer", "name");

  // Map local events to IEvent shape
  const localMapped: IEvent[] = localEvents.map((e) => ({
    _id: e._id.toString(),
    title: e.title,
    description: e.description ?? "",
    location: e.location,
    date: e.date ?? "", // or keep as Date
    time: e.time,
    duration: e.duration,
    category: e.category,
    format: e.format,
    language: e.language,
    capacity: e.capacity,
    registrationDeadline: e.registrationDeadline
      ? e.registrationDeadline
      : undefined,
    image: e.image,
    agenda: e.agenda || [],
    contact: e.contact,
    organizer: e.organizer, // typed as IUser
    external: false,
    url: undefined,
  }));

  // Determine how many external events to fetch
  const localCount = localMapped.length;
  const externalLimit = limit - localCount > 0 ? limit - localCount : 0;

  // -------------------------
  // 3) Query External (Ticketmaster)
  // -------------------------
  let externalTotal = 0;
  let externalMapped: IEvent[] = [];

  if (TICKETMASTER_API_KEY) {
    // Build Ticketmaster URL
    const tmUrl = new URL(
      "https://app.ticketmaster.com/discovery/v2/events.json"
    );
    tmUrl.searchParams.set("apikey", TICKETMASTER_API_KEY);

    // We’ll pass the same 'search' as 'keyword'
    if (search) tmUrl.searchParams.set("keyword", search);
    if (city) tmUrl.searchParams.set("city", city);

    // Use the same page/limit approach
    // Ticketmaster uses 0-based index for "page"
    // We'll do page - 1 for 0-based
    tmUrl.searchParams.set("page", (page - 1).toString());
    tmUrl.searchParams.set("size", externalLimit.toString());

    const tmRes = await fetch(tmUrl.toString());
    const tmData = await tmRes.json();

    if (tmData.page) {
      externalTotal = tmData.page.totalElements || 0; // e.g. 270012
    }

    if (tmData._embedded?.events) {
      externalMapped = tmData._embedded.events.map((ev: any): IEvent => {
        const cityName = ev._embedded?.venues?.[0]?.city?.name ?? "";
        const stateName = ev._embedded?.venues?.[0]?.state?.name ?? "";
        const countryName = ev._embedded?.venues?.[0]?.country?.name ?? "";
        const addressLine = ev._embedded?.venues?.[0]?.address?.line1 ?? "";

        return {
          _id: ev.id,
          title: ev.name,
          description: ev.info ?? "",
          location: {
            city: cityName,
            state: stateName,
            country: countryName,
            address: addressLine,
            lat: Number(ev._embedded?.venues?.[0]?.location?.latitude ?? 0),
            lng: Number(ev._embedded?.venues?.[0]?.location?.longitude ?? 0),
          },
          date: ev.dates?.start?.localDate ?? "",
          time: ev.dates?.start?.localTime ?? "00:00",
          duration: undefined,
          category: EEventCategory.OTHER, // or parse from ev.classifications
          format: EEventFormat.OFFLINE,
          language: EEventLanguage.ENGLISH,
          capacity: undefined,
          registrationDeadline: undefined,
          image: ev.images?.[0]?.url,
          agenda: [],
          contact: { email: "", phone: 0 },
          organizer: "Ticketmaster", // we store a string
          external: true,
          url: ev.url,
        };
      });
    }
  }

  // -------------------------
  // 4) Combine + Single Pagination
  // -------------------------
  // We unify the docs from local + external for this page
  const combinedDocs: IEvent[] = [...localMapped, ...externalMapped];

  // For the total, we add localTotal + externalTotal
  const combinedTotal = localTotal + externalTotal;

  // pages = ceiling of combinedTotal / limit
  const combinedPages = Math.ceil(combinedTotal / limit);

  // Return single array + single pagination
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
