import User from "@/mongoose/models/User";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import AppResponse from "@/lib/server/AppResponse";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import { IUser } from "@/types/user.types";

// get user
export const GET = catchAsync(async (req) => {
  // guard
  await guard(req);

  // send response
  return new AppResponse(200, "success", { doc: req.user });
});

// update user
export const PATCH = catchAsync(async (req) => {
  // guard
  const user = await guard(req);

  const formData = await req.formData();
  const data = JSON.parse(formData.get("data") as string);
  const photo = formData.get("photo") as File;

  // extract data
  const { name, email, phone, dateOfBirth, bio } = data as IUser;

  const dataToUpdate = {
    name,
    email,
    phone,
    dateOfBirth,
    bio,
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
});

// delete user
export const DELETE = catchAsync(async (req) => {
  // guard
  const user = await guard(req);
  // delete user
  await User.findByIdAndDelete(user._id);
  // send response
  return new AppResponse(200, "user deleted");
});
