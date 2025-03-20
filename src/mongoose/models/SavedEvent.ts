import { Model, model, models } from "mongoose";
import { ISavedEvent } from "@/types/event.types";
import savedEventSchema from "../schemas/savedEvent/savedEventSchema";

const SavedEvent =
  (models.SavedEvent as Model<ISavedEvent>) ||
  model<ISavedEvent>("SavedEvent", savedEventSchema);

export default SavedEvent;
