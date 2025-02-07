import { Schema } from "mongoose";
import { EUserRole, IUser } from "@/types/user.types";
import isEmail from "@/lib/isEmail";
import { encryptString } from "@/lib/server/encryptionHandler";
import defaultSchemaOptions from "../defaultSchemaOptions";
import photoSchema from "./photoSchema";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (email: string) => isEmail(email),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: (password: string) =>
          password.length >= 8 && password.length <= 20,
        message: "password must be within 8-20 characters",
      },
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: {
      type: Date,
      cast: "Not a valid date",
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: Object.values(EUserRole),
        message: `Invalid role. Allowed roles: ${Object.values(EUserRole)}`,
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
    dateOfBirth: {
      type: Date,
      cast: "Not a valid date",
    },
    photo: {
      type: photoSchema,
      cast: "Not a valid photo object",
    },
    bio: { type: String },
    disabled: { type: Boolean, default: false },
    subscribeToEmails: { type: Boolean, default: false },
  },
  defaultSchemaOptions
);

// encrypt password before saving
userSchema.pre("save", async function (next) {
  // Encrypt password only if the password is modified
  if (this.isModified("password")) {
    this.password = await encryptString(this.password as string);
  }

  next();
});

export default userSchema;
