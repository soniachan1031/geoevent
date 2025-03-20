// src/pages/api/events/[id]/analytics.ts

import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import connectDB from "@/lib/server/connectDB";
import { guard } from "@/lib/server/middleware/guard";
import { EUserRole } from "@/types/user.types";

import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventShare from "@/mongoose/models/EventShare";

import { Types } from "mongoose";

export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // Connect to database
    await connectDB();

    // Guard: only allow logged-in users
    const user = await guard(req);

    // extract id
    const { id } = await params;

    if (!id || typeof id !== "string") {
      throw new AppError(400, "Invalid event id");
    }

    // Check event existence
    const event = await Event.findById(id);
    if (!event) throw new AppError(404, "Event not found");

    // Check if user is the organizer or admin
    if (
      event.organizer !== user._id.toString() &&
      user.role !== EUserRole.ADMIN
    ) {
      throw new AppError(403, "Forbidden");
    }

    // ---------------------------
    // 1) Total Views
    // ---------------------------
    const aggViews = await EventViews.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);
    const totalViews = aggViews[0]?.totalViews ?? 0;

    // ---------------------------
    // 2) Total Registrations
    // ---------------------------
    const totalRegistrations = await EventRegistration.countDocuments({
      event: id,
    });

    // ---------------------------
    // 3) Feedback stats
    // ---------------------------
    const totalFeedbackCount = await EventFeedback.countDocuments({
      event: id,
    });

    const avgRatingAgg = await EventFeedback.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
        },
      },
    ]);
    const averageRating = avgRatingAgg[0]?.average ?? 0;

    // rating distribution
    const ratingDist = await EventFeedback.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // optional: registrations over time
    const registrationsOverTime = await EventRegistration.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
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

    // ---------------------------
    // 4) Shares data
    // ---------------------------
    // a) total shares
    const totalShares = await EventShare.countDocuments({
      event: id,
    });

    // b) shares by media
    //    returns array like [ { _id: "Facebook", count: 3 }, { _id: "WhatsApp", count: 2 } ]
    const shareByMedia = await EventShare.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
      {
        $group: {
          _id: "$media",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // optional: sharesOverTime
    const sharesOverTime = await EventShare.aggregate([
      { $match: { event: new Types.ObjectId(id) } },
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

    // Build up the analytics object
    const analytics = {
      totalViews,
      totalRegistrations,
      totalFeedbackCount,
      averageRating,
      ratingDistribution: ratingDist,
      registrationsOverTime,
      // new share data
      totalShares,
      shareByMedia,
      sharesOverTime,
    };

    return new AppResponse(200, "Event analytics retrieved", {
      analytics,
    });
  }
);
