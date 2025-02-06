import catchAsync from "@/lib/server/catchAsync";
import AppResponse from "@/lib/server/AppResponse";
import { guard } from "@/lib/server/middleware/guard";
import { IEvent } from "@/types/event.types";
import { clearS3Folder, uploadImage } from "@/lib/server/s3UploadHandler";
import Event from "@/mongoose/models/Event";
import { EUserRole } from "@/types/user.types";
import AppError from "@/lib/server/AppError";

// update event
export const PATCH = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    const user = await guard(req);

    // check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "event not found");
    }

    // check if user is the organizer or admin
    if (
      String(event.organizer) !== user._id.toString() &&
      user.role !== EUserRole.ADMIN
    ) {
      throw new AppError(403, "forbidden");
    }

    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);
    const image = formData.get("image") as File;

    // extract data
    const {
      title,
      description,
      location,
      date,
      time,
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
      time,
      registrationDeadline,
      duration,
      category,
      format,
      language,
      capacity,
      contact,
      organizer: user._id,
    } as Partial<IEvent>;

    // handle image
    if (image?.size > 0) {
      // upload image
      const url = await uploadImage({
        file: image,
        folder: `events/${event._id}/image`,
        width: 700,
      });

      // update event image
      eventData.image = url;
    }

    // update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $set: eventData,
      },
      { new: true }
    );
    // send response
    return new AppResponse(200, "event updated successfully", {
      doc: updatedEvent,
    });
  }
);

// delete event
export const DELETE = catchAsync(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    // extract id
    const { id } = await params;

    // guard
    const user = await guard(req);

    // check if event exists
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(404, "event not found");
    }

    // check if user is the organizer or admin
    if (
      String(event.organizer) !== user._id.toString() &&
      user.role !== EUserRole.ADMIN
    ) {
      throw new AppError(403, "forbidden");
    }

    // delete event
    await Event.findByIdAndDelete(id);

    // delete event image from s3
    if (event.image) {
      await clearS3Folder(`events/${event._id}/image`);
    }

    // send response
    return new AppResponse(200, "event deleted successfully");
  }
);
