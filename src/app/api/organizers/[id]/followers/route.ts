import { Types } from "mongoose";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import { guard } from "@/lib/server/middleware/guard";
import connectDB from "@/lib/server/connectDB";
import Follower from "@/mongoose/models/Follower";
import { EUserRole } from "@/types/user.types";

export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await connectDB();

    const currentUser = await guard(req);

    // extract id
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid organizer ID");
    }

    // Only allow  the organizer or admin to view the followers
    if (
      currentUser._id.toString() !== id &&
      currentUser.role !== EUserRole.ADMIN
    ) {
      throw new AppError(403, "You are not authorized to view these followers");
    }

    const followers = await Follower.find({ organizer: id }).populate({
      path: "follower",
      select: "name photo email",
    });

    return new AppResponse(200, "Followers retrieved successfully", {
      docs: followers.map((f) => f.follower),
    });
  }
);
