import connectDB from "@/lib/server/connectDB";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import { EUserRole } from "@/types/user.types";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import Follower from "@/mongoose/models/Follower";
import { TOrganizerOverview } from "@/components/OrganizerDashboard/OrganizerDashboardOverview";

export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await connectDB();
    const { id: organizerId } = await params;
    const currentUser = await guard(req);

    if (!organizerId) {
      throw new AppError(400, "Organizer ID is required");
    }

    const isOwner = String(currentUser._id) === organizerId;
    const isAdmin = currentUser.role === EUserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError(403, "You are not authorized to view this dashboard");
    }

    // 1. Basic Stats
    const totalEvents = await Event.countDocuments({ organizer: organizerId });
    const upcomingEvents = await Event.countDocuments({
      organizer: organizerId,
      date: { $gte: new Date() },
    });
    const completedEvents = await Event.countDocuments({
      organizer: organizerId,
      date: { $lt: new Date() },
    });

    const totalFollowers = await Follower.countDocuments({
      organizer: organizerId,
    });

    // 2. Total views for this organizer’s events
    const totalViewsAgg = await EventViews.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: "$views" },
        },
      },
    ]);
    const totalViews = totalViewsAgg[0]?.views ?? 0;

    // 3. Total registrations for their events
    const totalRegistrations = await EventRegistration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
      {
        $count: "count",
      },
    ]);
    const totalEventRegistrations = totalRegistrations[0]?.count ?? 0;

    // 4. Average rating for their events
    const avgRatingAgg = await EventFeedback.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
        },
      },
    ]);
    const averageRating = avgRatingAgg[0]?.average ?? 0;

    // 5. Most registered events (top 5)
    const topRegisteredEvents = await EventRegistration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
      {
        $group: {
          _id: "$event",
          registrations: { $sum: 1 },
          eventTitle: { $first: "$eventData.title" },
        },
      },
      { $sort: { registrations: -1 } },
      { $limit: 5 },
    ]);

    // 6. Most viewed events (top 5)
    const topViewedEvents = await EventViews.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
      {
        $project: {
          views: 1,
          eventId: "$eventData._id",
          title: "$eventData.title",
        },
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);

    // 7. Registrations over time (grouped by day)
    const registrationsOverTime = await EventRegistration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      { $unwind: "$eventData" },
      {
        $match: {
          "eventData.organizer": organizerId,
        },
      },
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

    return new AppResponse(200, "Organizer dashboard fetched successfully", {
      eventStats: {
        totalEvents,
        completedEvents,
        upcomingEvents,
        totalViews,
        totalEventRegistrations,
        averageRating,
      },
      audience: {
        totalFollowers,
      },
      highlights: {
        topRegisteredEvents,
        topViewedEvents,
      },
      trends: {
        registrationsOverTime,
      },
    } as TOrganizerOverview);
  }
);
