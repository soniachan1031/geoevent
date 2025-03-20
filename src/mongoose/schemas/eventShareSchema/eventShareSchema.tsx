import Event from "@/mongoose/models/Event";
import User from "@/mongoose/models/User";
import { EEventShareMedia, IEventShare } from "@/types/event.types";
import { Schema } from "mongoose";

const eventShareSchema = new Schema<IEventShare>({
  event: {
    type: Schema.Types.ObjectId,
    ref: Event,
    required: [true, "event is required"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  media: {
    type: String,
    required: [true, "media is required"],
    enum: {
      values: Object.values(EEventShareMedia),
      message: `Invalid media. Allowed media: ${Object.values(
        EEventShareMedia
      )}`,
    },
  },
  date: { type: Date, default: Date.now },
});

export default eventShareSchema;
