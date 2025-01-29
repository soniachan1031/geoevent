import User from "@/mongoose/models/User";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import AppResponse from "@/lib/server/AppResponse";
import { uploadProfilePic } from "@/lib/server/s3UploadHandler";
import { EUserRole, IUser } from "@/types/user.types";
import AppError from "@/lib/server/AppError";
import { verifyEncryptedString } from "@/lib/server/encryptionHandler";
import { removeAuthCookie } from "@/lib/server/cookieHandler";

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
  const user = await guard(req, EUserRole.ADMIN);

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
    const url = await uploadProfilePic({
      file: photo,
      docId: user._id,
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
  const user = await guard(req, EUserRole.ADMIN); // only admin can delete themselve

  const userWithPassword = await User.findById(user._id).select("password");

  if (!userWithPassword) throw new AppError(404, "user not found");

  // get data from request url
  const url = new URL(req.url);
  const { password } = Object.fromEntries(url.searchParams.entries());

  // if password is not provided, throw error
  if (!password) throw new AppError(400, "password is required");

  // check password
  if (!password) throw new AppError(400, "password is required");
  const passwordVerified = await verifyEncryptedString(
    password,
    userWithPassword.password as string
  );

  // if not verified, throw error
  if (!passwordVerified) throw new AppError(401, "invalid credentials");

  // delete user
  await User.findByIdAndDelete(user._id);

  // remove auth cookie
  removeAuthCookie();

  // send response
  return new AppResponse(200, "user deleted");
});
