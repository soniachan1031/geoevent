import { IUserPhoto } from "@/types/user.types";
import { Schema } from "mongoose";

const photoSchema = new Schema<IUserPhoto>({
  alt: {
    type: String,
    required: [true, "Photo alt is required"],
  },
  url: {
    type: String,
    required: [true, "Photo url is required"],
  },
});

export default photoSchema;
