import connectDB from "@/lib/server/connectDB";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import catchAsync from "@/lib/server/catchAsync";
import Event from "@/mongoose/models/Event";
import { guard } from "@/lib/server/middleware/guard";
import { EUserRole } from "@/types/user.types";
import { Types } from "mongoose";

export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await connectDB();

    const { id: organizerId } = await params;

    if (!organizerId) {
      throw new AppError(400, "Organizer ID is required");
    }

    const currentUser = await guard(req);

    const isOwner = String(currentUser._id) === organizerId;
    const isAdmin = currentUser.role === EUserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new AppError(403, "Unauthorized to view these events");
    }

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

    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "30", 10);

    // Filters
    const filters: Record<string, any> = {
      organizer: organizerId,
    };

    if (search) {
      if (Types.ObjectId.isValid(search)) {
        filters._id = search;
      } else {
        filters.title = { $regex: search, $options: "i" };
      }
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

    if (category) filters.category = category;
    if (format) filters.format = format;
    if (language) filters.language = language;

    // Query events
    const total = await Event.countDocuments(filters);
    const events = await Event.find(filters)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizer", "name");

    return new AppResponse(200, "Hosted events fetched successfully", {
      docs: events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);
