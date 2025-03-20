import { TEventAgenda } from "@/types/event.types";
import { Schema } from "mongoose";

const eventAagendaSchema = new Schema<TEventAgenda>({
  time: {
    type: String,
    required: [true, "Time is required"],
  },
  activity: {
    type: String,
    required: [true, "Activity is required"],
  },
});

export default eventAagendaSchema;