import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { guard } from "@/lib/server/middleware/guard";
import { IEvent } from "@/types/event.types";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import Event from "@/mongoose/models/Event";

// create event
export const POST = catchAsync(async (req) => {
  // guard
  const user = await guard(req);

  const formData = await req.formData();
  const data = JSON.parse(formData.get("data") as string);
  const image = formData.get("image") as File;

  // extract data
  const {
    title,
    description,
    location,
    date,
    duration,
    category,
    format,
    language,
    capacity,
    registrationDeadline,
    contact,
  } = data as IEvent;

  const eventData = {
    title,
    description,
    location,
    date,
    registrationDeadline,
    duration,
    category,
    format,
    language,
    capacity,
    contact,
    organizer: user._id,
  } as Partial<IEvent>;

  // create event
  const newEvent = await Event.create(eventData);

  // handle image
  if (image?.size > 0) {
    // upload image
    const url = await uploadImage({
      file: image,
      folder: `events/${newEvent._id}/image`,
      width: 700,
    });

    // update event with image
    newEvent.image = url;
    await newEvent.save();
  }

  // send response
  return new AppResponse(200, "event created successfully", { doc: newEvent });
});
