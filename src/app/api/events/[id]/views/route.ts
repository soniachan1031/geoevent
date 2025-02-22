import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";

// add views for event
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "event not found");
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

    // guard
    await guard(req);

    // get feedback
    const views = await EventViews.find({ event: id });

    return new AppResponse(200, "feedbacks retrieved", { docs: views });
  }
);
