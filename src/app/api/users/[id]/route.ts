import User from "@/mongoose/models/User";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import AppResponse from "@/lib/server/AppResponse";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import { EUserRole, IUser } from "@/types/user.types";
import sendMail from "@/lib/server/email/sendMail";
import { MAIL_SMTP_PASSWORD, MAIL_SMTP_USERNAME } from "@/lib/credentials";
import deleteProfileTemplate from "@/lib/server/email/templates/deleteProfileTemplate";
import AppError from "@/lib/server/AppError";

// get user
// GET /api/users/:id
export const GET = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    await guard(req, EUserRole.ADMIN);

    // get user
    const user = await User.findById(id);

    if (!user) throw new AppError(404, "user not found");

    // send response
    return new AppResponse(200, "user retrieved", { doc: user });
  }
);

// update user
// PUT /api/users/[id]
export const PATCH = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    await guard(req, EUserRole.ADMIN);

    // check if user exists
    const user = await User.findById(id);

    if (!user) throw new AppError(404, "user not found");

    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);
    const photo = formData.get("photo") as File;

    // extract data
    const { name, email, phone, dateOfBirth, bio, interestedCategories } = data as IUser;

    const dataToUpdate = {
      name,
      email,
      phone,
      dateOfBirth,
      bio,
      interestedCategories,
    } as Partial<IUser>;

    // handle image
    if (photo?.size > 0) {
      // upload image
      const url = await uploadImage({
        file: photo,
        folder: `users/${user._id}/profile-pic`,
        width: 100,
        height: 100,
      });

      // update data
      dataToUpdate.photo = { url, alt: user.name };
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: dataToUpdate,
      },
      { new: true }
    );

    // send response
    return new AppResponse(200, "profile updated", { doc: updatedUser });
  }
);

// delete user
// DELETE /api/users/[id]
export const DELETE = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    await guard(req, EUserRole.ADMIN);

    // check if user exists
    const user = await User.findById(id);

    if (!user) throw new AppError(404, "user not found");

    // delete user
    const deletedUser = await User.findByIdAndDelete(user._id);

    if (!deletedUser) throw new AppError(500, "user not deleted");

    // send confirmation email
    try {
      await sendMail({
        smtpUserName: MAIL_SMTP_USERNAME,
        smtpPassword: MAIL_SMTP_PASSWORD,
        to: user.email,
        subject: "Profile Deleted",
        html: deleteProfileTemplate({
          user,
          req,
        }),
      });
    } catch {}

    // send response
    return new AppResponse(200, "user deleted");
  }
);
