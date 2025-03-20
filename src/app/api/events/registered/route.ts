import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import EventRegistration from "@/mongoose/models/EventRegistration";

// Get registered events for user
export const GET = catchAsync(async (req) => {
  // Authenticate user
  const user = await guard(req);

  // Find all registered events
  const registeredEvents = await EventRegistration.find({
    user: user._id,
  }).populate("event");

  return new AppResponse(200, "Registered events", {
    docs: registeredEvents,
  });
});
