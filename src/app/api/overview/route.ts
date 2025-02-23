import { TAdminDashboardOverview } from "@/components/AdminDashboard/AdminDashboardOverview/Index";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import Event from "@/mongoose/models/Event";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventViews from "@/mongoose/models/EventViews";
import User from "@/mongoose/models/User";
import { EUserRole } from "@/types/user.types";

export const GET = catchAsync(async (req) => {
  // guard
  await guard(req, EUserRole.ADMIN);

  // count total usres
  const usersCount = await User.countDocuments();

  // count total events
  const eventsCount = await Event.countDocuments();

  // count total event views
  const eventViewsCount = await EventViews.aggregate([
    {
      $group: {
        _id: null,
        views: { $sum: "$views" },
      },
    },
  ]);

  // count total events completed
  const eventsCompletedCount = await Event.countDocuments({
    date: { $lt: new Date() },
  });

  // count total event feedbacks
  const eventFeedbacksCount = await EventFeedback.countDocuments();

  // all events feedback average
  const allEventsFeedbackAverage = await EventFeedback.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
      },
    },
  ]);

  return new AppResponse(200, "Users fetched successfully", {
    usersCount,
    eventsCount,
    eventViewsCount: eventViewsCount[0]?.views ?? 0,
    eventsCompletedCount,
    eventFeedbacksCount,
    allEventsFeedbackAverage: allEventsFeedbackAverage[0]?.average ?? 0,
  } as TAdminDashboardOverview);
});
