import { Schema, Types } from "mongoose";
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
import eventContactSchema from "./eventContactSchema";
import { isAfter, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { eventTimeRegex } from "@/lib/regex";

const timeZone = "UTC"; // Ensure dates are treated as UTC
const startOfUTC = () =>
  startOfDay(
    new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      )
    )
  );

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
        validator: (date: Date) => {
          const inputDate = startOfDay(toZonedTime(date, timeZone)); // Convert input date to UTC
          const today = startOfUTC(); // Convert today's date to UTC

          return (
            isAfter(inputDate, today) || inputDate.getTime() === today.getTime()
          );
        },
        message: "Event date must be today or in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      validate: {
        validator: (time: string) => eventTimeRegex.test(time),
        message: "Invalid time format",
      },
    },
    registrationDeadline: {
      type: Date,
      validate: {
        validator: function (this: IEvent, deadline: Date) {
          if (!this.date) return true; // Skip validation if event date is not set

          const deadlineDate = startOfDay(toZonedTime(deadline, timeZone));
          const eventDate = startOfDay(toZonedTime(this.date, timeZone));

          return deadlineDate <= eventDate;
        },
        message: "Registration deadline must be on or before the event date",
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
    contact: {
      type: eventContactSchema,
      required: [true, "Event contact is required"],
      cast: "Invalid contact format",
    },
    organizer: {
      type: Types.ObjectId,
      ref: User,
      required: [true, "Organizer is required"],
    },
  },
  defaultSchemaOptions
);

export default eventSchema;
