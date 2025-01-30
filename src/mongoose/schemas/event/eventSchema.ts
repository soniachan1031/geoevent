import { Schema, model, Types } from "mongoose";
import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";
import defaultSchemaOptions from "../defaultSchemaOptions";
import locationSchema from "../locationSchema";
import eventAgendaSchema from "./eventAgendaSchema";
import User from "@/mongoose/models/User";
import isEmail from "@/lib/isEmail";

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    location: {
      type: locationSchema,
      required: [true, "Event location is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: (date: Date) => date >= new Date(),
        message: "Event date must be today or in the future",
      },
    },
    duration: {
      type: Number,
      min: [10, "Event duration must be at least 10 minutes"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: Object.values(EEventCategory),
    },
    format: {
      type: String,
      required: [true, "Event format is required"],
      enum: Object.values(EEventFormat),
    },
    language: {
      type: String,
      enum: Object.values(EEventLanguage),
      default: EEventLanguage.ENGLISH,
    },
    capacity: {
      type: Number,
      min: [1, "Event capacity must be at least 1 person"],
    },
    tags: {
      type: [String],
      default: [],
    },
    registrationDeadline: {
      type: Date,
      validate: {
        validator: function (this: IEvent, date: Date) {
          return date < new Date(this.date);
        },
        message: "Registration deadline must be before the event date",
      },
    },
    image: {
      type: String,
      validate: {
        validator: (url: string) =>
          /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(url),
        message: "Invalid image URL format",
      },
    },
    agenda: {
      type: [eventAgendaSchema],
      default: [],
    },
    email: {
      type: String,
      required: [true, "Contact email is required"],
      validate: {
        validator: (email: string) => isEmail(email),
        message: "Invalid email format",
      },
    },
    phone: {
      type: Number,
      cast: "Not a valid phone number",
      validate: {
        validator: (number: number) => number.toString().length === 10,
        message: "Phone number must be 10 digits long",
      },
    },
    organizer: {
      type: Types.ObjectId,
      ref: User,
      required: [true, "Organizer is required"],
    },
  },
  defaultSchemaOptions
);

export default model("Event", eventSchema);
