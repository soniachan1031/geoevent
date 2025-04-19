import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import User from "@/mongoose/models/User";
import { EUserRole } from "@/types/user.types";

// GET /api/organizers
export const GET = catchAsync(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  // Optional: Search by name
  const query = searchParams.get("q");
  const filter = {
    role: { $in: [EUserRole.ORGANIZER, EUserRole.ADMIN] },
    ...(query && {
      name: { $regex: query, $options: "i" },
    }),
  };

  const [organizers, total] = await Promise.all([
    User.find(filter)
      .select("name photo bio")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return new AppResponse(200, "Organizers fetched successfully", {
    docs: organizers,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});
