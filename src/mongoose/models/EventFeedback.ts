import { Model, model, models } from "mongoose";
import { IEventFeedback } from "@/types/event.types";
import eventFeedbackSchema from "../schemas/eventFeedback/eventFeedbackSchema";

const EventFeedback =
  (models.EventFeedback as Model<IEventFeedback>) ||
  model<IEventFeedback>("EventFeedback", eventFeedbackSchema);

export default EventFeedback;
