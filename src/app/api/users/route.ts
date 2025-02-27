  import AppResponse from "@/lib/server/AppResponse";
  import catchAsync from "@/lib/server/catchAsync";
  import connectDB from "@/lib/server/connectDB";
  import { guard } from "@/lib/server/middleware/guard";
  import User from "@/mongoose/models/User";
  import { TPagination } from "@/types/api.types";
  import { EUserRole } from "@/types/user.types";
  import { Types } from "mongoose";

  export const GET = catchAsync(async (req) => {
    // guard
    await guard(req, EUserRole.ADMIN);

    // Extract query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "30", 10); // Default limit: 30

    // Build filter object
    const filters: Record<string, any> = {};

    // Search by id or name
    if (search) {
      // If 'search' is a valid ObjectId, match _id
      if (Types.ObjectId.isValid(search)) {
        filters._id = search;
      } else {
        // Otherwise, just do a case-insensitive regex on name
        filters.name = { $regex: search, $options: "i" };
      }
    }

    // filter out admin users
    // filters.role = { $ne: EUserRole.ADMIN };

    // connect database
    await connectDB();

    // Count total matching users (for pagination)
    const total = await User.countDocuments(filters);
    const pages = Math.ceil(total / limit);

    // Fetch paginated results
    const users = await User.find(filters)
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit); // Limit per page

    return new AppResponse(200, "Users fetched successfully", {
      docs: users,
      pagination: {
        total,
        pages,
        page,
        limit,
      } as TPagination,
    });
  });
