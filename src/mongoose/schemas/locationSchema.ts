import { TLocation } from "@/types/location.types";
import { Schema } from "mongoose";

const locationSchema = new Schema<TLocation>({
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
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
