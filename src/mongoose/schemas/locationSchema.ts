import { TLocation } from "@/types/location.types";
import { Schema } from "mongoose";

const locationSchema = new Schema<TLocation>({
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  lat: {
    type: Number,
    required: [true, "Latitude is required"],
  },
  lng: {
    type: Number,
    required: [true, "Longitude is required"],
  },
});

export default locationSchema;
