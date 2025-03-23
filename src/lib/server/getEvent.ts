import { IEvent } from "@/types/event.types";
import { isValidObjectId } from "mongoose";
import connectDB from "./connectDB";
import Event from "@/mongoose/models/Event";
import ticketMasterToLocalEvent from "../ticketMasterToLocalEvent";
import { TICKETMASTER_API_KEY } from "../credentials";

export default async function getEvent(id: string): Promise<IEvent | null> {
  try {
    let event: IEvent | null = null;

    // check if event exists in the database
    if (isValidObjectId(id)) {
      await connectDB();
      event = await Event.findById(id).populate("organizer");
    }

    // if event not found in the database, fetch from ticketmaster
    if (!event) {
      try {
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=${TICKETMASTER_API_KEY}`
        );
        const data = await res.json();
        if (data.errors) return null;
        event = ticketMasterToLocalEvent(data);
      } catch {}
    }

    return event;
  } catch {
    return null;
  }
}
