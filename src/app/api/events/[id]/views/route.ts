import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import { ECookieName } from "@/types/api.types";
import { cookies } from "next/headers";

// add views for event
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    await connectDB();

    // check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "event not found");
    }

    const user = await getUser((await cookies()).get(ECookieName.AUTH)?.value);

    // check if user is the organizer
    if (event.organizer === user?._id) {
      throw new AppError(400, "organizer cannot add views to own event");
    }

    // add view
    const view = await EventViews.findOneAndUpdate(
      {
        event: id,
      },
      {
        $inc: { views: 1 },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return new AppResponse(200, "views added", { doc: view });
  }
);

// retrieve views for event
export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    await connectDB();

    // get feedback
    const views = await EventViews.find({ event: id });

    return new AppResponse(200, "feedbacks retrieved", { docs: views });
  }
);
