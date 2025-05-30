import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import { guard } from "@/lib/server/middleware/guard";
import { parseJson } from "@/lib/server/reqParser";
import Event from "@/mongoose/models/Event";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventRegistration from "@/mongoose/models/EventRegistration";

// leave feedback for event
// POST /api/events/[id]/feedbacks
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
    if (event.date > new Date()) {
      throw new AppError(400, "Event has not ended yet, feedback not allowed.");
    }

    // check if user registered for event
    const registeredEvent = await EventRegistration.findOne({
      event: id,
      user: user._id,
    });

    if (!registeredEvent) {
      throw new AppError(400, "not registered for event yet");
    }

    // check if user has already left feedback
    const savedEvent = await EventFeedback.findOne({
      event: id,
      user: user._id,
    });

    if (savedEvent) {
      throw new AppError(400, "feedback already left");
    }

    // extract data
    const { rating, review } = await parseJson(req);

    // save feedback
    const feedback = await EventFeedback.create({
      event: id,
      user: user._id,
      rating,
      review,
    });

    return new AppResponse(200, "feedback saved", { doc: feedback });
  }
);

// retrieve feedbacks for event
// GET /api/events/[id]/feedbacks
export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    await connectDB();

    // get feedback
    const feedback = await EventFeedback.find({ event: id }).populate(
      "user",
      "name photo"
    );

    return new AppResponse(200, "feedbacks retrieved", { docs: feedback });
  }
);
