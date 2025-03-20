import isEmail from "@/lib/isEmail";
import { TEventContact } from "@/types/event.types";
import { Schema } from "mongoose";

const eventContactSchema = new Schema<TEventContact>({
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: (email: string) => isEmail(email),
      message: "Invalid email format",
    },
  },
  phone: {
    type: Number,
    required: [true, "Phone is required"],
  },
});

export default eventContactSchema;
