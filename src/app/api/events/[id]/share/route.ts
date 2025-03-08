// src/app/api/events/[id]/share/route.ts

import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import { parseJson } from "@/lib/server/reqParser";

import Event from "@/mongoose/models/Event";
import EventShare from "@/mongoose/models/EventShare";
import { ECookieName } from "@/types/api.types";
import { EEventShareMedia } from "@/types/event.types";
import { cookies } from "next/headers";

// POST /api/events/[id]/share
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params; // event id
    await connectDB();

    // 1) Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "Event not found");
    }

    // 2) Parse request body
    const { media } = await parseJson(req);
    if (!media) {
      throw new AppError(400, "media is required");
    }

    // check if media is correct value
    if (!Object.values(EEventShareMedia).includes(media)) {
      throw new AppError(400, `Invalid media type: ${media}`);
    }

    // 3) If user is authenticated, store user._id, otherwise null
    let userId: string | null = null;

    const user = await getUser((await cookies()).get(ECookieName.AUTH)?.value);
    if (user) userId = user._id;

    // 4) Create the share doc
    const shareDoc = await EventShare.create({
      event: id,
      user: userId,
      media,
    });

    return new AppResponse(200, "Event shared successfully", {
      doc: shareDoc,
    });
  }
);

// GET /api/events/[id]/share
export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params; // event id
    await connectDB();

    // Retrieve all shares for this event
    const shares = await EventShare.find({ event: id })
      .populate("user", "name photo")
      .sort({ date: -1 });

    return new AppResponse(200, "Shares retrieved", { docs: shares });
  }
);
