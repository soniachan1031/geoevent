import Event from "@/mongoose/models/Event";
import { IEventViews } from "@/types/event.types";
import { Schema } from "mongoose";

const eventViewsSchema = new Schema<IEventViews>({
  event: {
    type: Schema.Types.ObjectId,
    ref: Event,
    required: [true, "event is required"],
  },
  views: {
    type: Number,
    default: 0,
  },
});

export default eventViewsSchema;
