import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import { parseJson } from "@/lib/server/reqParser";
import Event from "@/mongoose/models/Event";
import SavedEvent from "@/mongoose/models/SavedEvent";

// leave feedback for event
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

    // check if event is still open
    if (event.date < new Date()) {
      throw new AppError(400, "event is closed for feedback");
    }

    // check if user has already left feedback
    const savedEvent = await SavedEvent.findOne({ event: id, user: user._id });

    if (savedEvent) {
      throw new AppError(400, "feedback already left");
    }

    // extract data
    const { rating, review } = await parseJson(req);

    // save feedback
    const feedback = new SavedEvent({
      event: id,
      user: user._id,
      rating,
      review,
    });

    return new AppResponse(200, "feedback saved", { doc: feedback });
  }
);
