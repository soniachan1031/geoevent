import Event from "@/mongoose/models/Event";
import User from "@/mongoose/models/User";
import { IEventRegistration } from "@/types/event.types";
import { Schema } from "mongoose";

const EventRegistrationSchema = new Schema<IEventRegistration>({
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
});

export default EventRegistrationSchema;
