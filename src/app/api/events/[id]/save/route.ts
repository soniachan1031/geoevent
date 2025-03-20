import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import Event from "@/mongoose/models/Event";
import SavedEvent from "@/mongoose/models/SavedEvent";

// save event for user
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    const user = await guard(req);

    // check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "event not found");
    }

    // Upsert saved event
    const savedEvent = await SavedEvent.findOneAndUpdate(
      { event: id, user: user._id }, // Search criteria
      { event: id, user: user._id }, // Data to upsert
      { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert options
    );

    return new AppResponse(200, "event saved", { doc: savedEvent });
  }
);

// Unsave event for user
export const DELETE = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // Extract event ID
    const { id } = await params;

    // Authenticate user
    const user = await guard(req);

    // Remove saved event
    const deletedEvent = await SavedEvent.findOneAndDelete({
      event: id,
      user: user._id,
    });

    if (!deletedEvent) {
      throw new AppError(400, "Event is not saved");
    }

    return new AppResponse(200, "Event unsaved");
  }
);
