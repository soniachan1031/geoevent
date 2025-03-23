// src/pages/api/overview.ts (Next.js 12)
// or src/app/api/overview/route.ts (Next.js 13+)

import { TAdminDashboardOverview } from "@/components/AdminDashboard/AdminDashboardOverview/Index";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import Event from "@/mongoose/models/Event";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventShare from "@/mongoose/models/EventShare"; // <--- add import
import User from "@/mongoose/models/User";
import { EUserRole } from "@/types/user.types";
import { startOfMonth } from "date-fns";

// GET /api/overview
export const GET = catchAsync(async (req) => {
  // Ensure only admin can access
  await guard(req, EUserRole.ADMIN);

  // 1. USER MANAGEMENT METRICS
  // --------------------------
  const totalUsers = await User.countDocuments();

  // Active users (in the last 30 days)
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

  const activeRegUsers = await EventRegistration.distinct("user", {
    date: { $gte: date30DaysAgo },
  });
  const activeFeedbackUsers = await EventFeedback.distinct("user", {
    date: { $gte: date30DaysAgo },
  });
  const activeUsersSet = new Set([...activeRegUsers, ...activeFeedbackUsers]);
  const activeUsers = activeUsersSet.size;

  // New users this month
  const firstOfThisMonth = startOfMonth(new Date());
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: firstOfThisMonth },
  });

  // 2. EVENT MANAGEMENT METRICS
  // ---------------------------
  const totalEvents = await Event.countDocuments();
  const totalCompletedEvents = await Event.countDocuments({
    date: { $lt: new Date() },
  });
  const upcomingEvents = await Event.countDocuments({
    date: { $gte: new Date() },
  });

  // event categories breakdown
  const eventCategoriesBreakdown = await Event.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  // most popular events (top 5)
  const mostPopularEvents = await EventRegistration.aggregate([
    {
      $group: {
        _id: "$event",
        registrations: { $sum: 1 },
      },
    },
    { $sort: { registrations: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $project: {
        _id: 0,
        eventId: "$event._id",
        title: "$event.title",
        registrations: 1,
      },
    },
  ]);

  // 3. ENGAGEMENT & PERFORMANCE
  // ---------------------------
  // total event views
  const totalEventViewsAgg = await EventViews.aggregate([
    {
      $group: {
        _id: null,
        views: { $sum: "$views" },
      },
    },
  ]);
  const totalEventViews = totalEventViewsAgg[0]?.views ?? 0;

  // total event feedbacks
  const totalEventFeedbacks = await EventFeedback.countDocuments();

  // average feedback rating (overall)
  const avgFeedbackRatingAgg = await EventFeedback.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
      },
    },
  ]);
  const averageFeedbackRating = avgFeedbackRatingAgg[0]?.average ?? 0;

  // rating distribution (all events) => group by rating
  // e.g. [ { _id: 5, count: 2 }, { _id: 4, count: 5 } ]
  const ratingDistAgg = await EventFeedback.aggregate([
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // registrations over time (for all events), grouped by day
  const registrationsOverTime = await EventRegistration.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  // most engaged users (top 5) by total registrations
  const mostEngagedUsers = await EventRegistration.aggregate([
    {
      $group: {
        _id: "$user",
        totalRegistrations: { $sum: 1 },
      },
    },
    { $sort: { totalRegistrations: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        userName: "$user.name",
        totalRegistrations: 1,
      },
    },
  ]);

  // most viewed events (top 5)
  const mostViewedEvents = await EventViews.aggregate([
    { $sort: { views: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "events",
        localField: "event",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $project: {
        _id: 0,
        eventId: "$event._id",
        title: "$event.title",
        views: 1,
      },
    },
  ]);

  // 4. SHARES (Optional)
  // If you do NOT have an EventShare model, remove this.
  // total shares
  const totalShares = await EventShare.countDocuments();

  // shares by media
  // returns array like [{_id: "Facebook", count: 3}, {_id: "WhatsApp", count: 5}, ...]
  const shareByMedia = await EventShare.aggregate([
    {
      $group: {
        _id: "$media",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // shares over time
  const sharesOverTime = await EventShare.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  // Return all results
  const overviewData: TAdminDashboardOverview = {
    userManagement: {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
    },
    eventManagement: {
      totalEvents,
      totalCompletedEvents,
      upcomingEvents,
      eventCategoriesBreakdown,
      mostPopularEvents,
    },
    engagement: {
      totalEventViews,
      totalEventFeedbacks,
      averageFeedbackRating,
      mostEngagedUsers,
      mostViewedEvents,

      // NEW fields
      ratingDistribution: ratingDistAgg, // e.g. [ { _id: 3, count: 2 }, ... ]
      registrationsOverTime, // e.g. [ { _id: {year,month,day}, count }, ... ]
      totalShares,
      shareByMedia, // e.g. [ { _id: "Facebook", count: 5 }, ... ]
      sharesOverTime, // e.g. [ { _id: {year,month,day}, count }, ... ]
    },
  };

  return new AppResponse(200, "Dashboard fetched successfully", overviewData);
});
