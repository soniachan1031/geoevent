import User from "@/mongoose/models/User";
import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import AppError from "@/lib/server/AppError";
import { guard } from "@/lib/server/middleware/guard";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import { EUserRole, IUser } from "@/types/user.types";

// POST /api/users/[id]/become-organizer
export const POST = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Only ADMIN or the user themselves can perform this action
    const currentUser = await guard(req, [EUserRole.ADMIN, EUserRole.USER]);

    if (
      currentUser.role !== EUserRole.ADMIN &&
      currentUser._id.toString() !== id
    ) {
      throw new AppError(403, "You are not authorized to perform this action");
    }

    const user = await User.findById(id);
    if (!user) throw new AppError(404, "User not found");

    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);
    const photo = formData.get("photo") as File;

    const dataToUpdate: Partial<IUser> = {
      name: data.name || user.name,
      role: EUserRole.ORGANIZER,
    };


    if (photo?.size > 0) {
      const url = await uploadImage({
        file: photo,
        folder: `users/${user._id}/organizer-profile`,
        width: 100,
        height: 100,
      });

      dataToUpdate.photo = {
        url,
        alt: data.name || user.name,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: dataToUpdate },
      { new: true }
    );

    return new AppResponse(200, "User is now an organizer", {
      doc: updatedUser,
    });
  }
);
