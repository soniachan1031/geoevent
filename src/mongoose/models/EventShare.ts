import { Model, model, models } from "mongoose";
import { IEventShare } from "@/types/event.types";
import eventShareSchema from "../schemas/eventShareSchema/eventShareSchema";

const EventShare =
  (models.EventShare as Model<IEventShare>) ||
  model<IEventShare>("EventShare", eventShareSchema);

export default EventShare;
