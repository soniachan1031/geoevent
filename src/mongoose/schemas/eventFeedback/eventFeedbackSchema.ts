import Event from "@/mongoose/models/Event";
import User from "@/mongoose/models/User";
import { IEventFeedback } from "@/types/event.types";
import { Schema } from "mongoose";

const eventFeedbackSchema = new Schema<IEventFeedback>({
  event: {
    type: Schema.Types.ObjectId,
    ref: Event,
    required: [true, "event is required"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: [true, "user is required"],
  },
  date: { type: Date, default: Date.now },
  rating: {
    type: Number,
    required: [true, "rating is required"],
  },
  review: {
    type: String,
    required: [true, "review is required"],
  },
});

export default eventFeedbackSchema;
