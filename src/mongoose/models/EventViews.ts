import { Model, model, models } from "mongoose";
import { IEventViews } from "@/types/event.types";
import eventViewsSchema from "../schemas/eventViewsSchema/eventViewsSchema";

const EventViews =
  (models.EventViews as Model<IEventViews>) ||
  model<IEventViews>("EventViews", eventViewsSchema);

export default EventViews;
