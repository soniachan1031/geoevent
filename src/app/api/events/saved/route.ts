import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import SavedEvent from "@/mongoose/models/SavedEvent";

// Get saved events for user
export const GET = catchAsync(async (req) => {
  // Authenticate user
  const user = await guard(req);

  // Find all saved events
  const savedEvents = await SavedEvent.find({ user: user._id }).populate(
    "event"
  );

  return new AppResponse(200, "Saved events", { docs: savedEvents });
});
