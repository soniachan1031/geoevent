import { Types } from "mongoose";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import Follower from "@/mongoose/models/Follower";
import User from "@/mongoose/models/User";
import { guard } from "@/lib/server/middleware/guard";
import { EUserRole } from "@/types/user.types";

// route: /api/organizers/following
// GET - List organizers the user is following
export const GET = catchAsync(async (req) => {
  const currentUser = await guard(req);

  const following = await Follower.find({ follower: currentUser._id }).populate(
    {
      path: "organizer",
      select: "name photo role",
    }
  );

  return new AppResponse(200, "Followed organizers retrieved", {
    docs: following.map((f) => f.organizer),
  });
});

// POST - Follow an organizer
export const POST = catchAsync(async (req) => {
  const currentUser = await guard(req);
  const { organizerId } = await req.json();

  if (!Types.ObjectId.isValid(organizerId)) {
    throw new AppError(400, "Invalid organizer ID");
  }

  if (organizerId === String(currentUser._id)) {
    throw new AppError(400, "You cannot follow yourself");
  }

  const organizer = await User.findById(organizerId);
  if (
    !organizer ||
    (organizer.role !== EUserRole.ORGANIZER &&
      organizer.role !== EUserRole.ADMIN)
  ) {
    throw new AppError(404, "Organizer not found");
  }

  const exists = await Follower.exists({
    follower: currentUser._id,
    organizer: organizerId,
  });

  if (exists) {
    return new AppResponse(200, "Already following");
  }

  await Follower.create({
    follower: currentUser._id,
    organizer: organizerId,
  });

  return new AppResponse(201, "Successfully followed organizer");
});

// DELETE - Unfollow an organizer
export const DELETE = catchAsync(async (req) => {
  const currentUser = await guard(req);
  const { organizerId } = await req.json();

  if (!Types.ObjectId.isValid(organizerId)) {
    throw new AppError(400, "Invalid organizer ID");
  }

  const deleted = await Follower.findOneAndDelete({
    follower: currentUser._id,
    organizer: organizerId,
  });

  if (!deleted) {
    throw new AppError(404, "Not following this organizer");
  }

  return new AppResponse(200, "Successfully unfollowed organizer");
});
