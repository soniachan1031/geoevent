import { Model, model, models } from "mongoose";
import { IEventRegistration } from "@/types/event.types";
import EventRegistrationSchema from "../schemas/eventRegistration/eventRegistrationSchema";

const EventRegistration =
  (models.EventRegistration as Model<IEventRegistration>) ||
  model<IEventRegistration>("EventRegistration", EventRegistrationSchema);

export default EventRegistration;
