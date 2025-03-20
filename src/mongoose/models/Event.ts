import { IEvent } from "@/types/event.types";
import { Model, model, models } from "mongoose";
import eventSchema from "../schemas/event/eventSchema";

const Event =
  (models.Event as Model<IEvent>) || model<IEvent>("Event", eventSchema);

export default Event;
