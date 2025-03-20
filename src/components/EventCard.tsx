import Link from "next/link";
import Image from "next/image";
import { IEvent } from "@/types/event.types";

interface EventCardProps {
  event: IEvent;
}

export default function EventCard({ event }: Readonly<EventCardProps>) {
  const link = event.external ? event.url ?? "/" : `events/${event._id}`;

  return (
    <Link href={link} target="_blank" className="group block w-full">
      <div className="w-full flex justify-center">
      <div
        className="shadow-md rounded-lg hover:shadow-lg transition duration-300 
                   w-full max-w-3xl overflow-hidden flex flex-col md:flex-row mx-auto"
      >
        {/* Event Image (Left for Desktop, Full Width for Mobile) */}
        <img
          src={event.image ?? "/logo.png"}
          alt={event.title}
          className="w-full md:w-[220px] h-[150px] object-cover rounded-lg"
        />

        {/* Event Details (Right for Desktop, Below for Mobile) */}
        <div className="p-4 flex flex-col justify-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">{event.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(event.date).toLocaleDateString("en-US", {
              timeZone: "UTC",
              weekday: "short",
              month: "long",
              day: "numeric",
            })}{" "}
            • {event.time}
          </p>
          <p className="text-sm text-gray-600">
            {event.location.city}, {event.location.state}
          </p>
        </div>
      </div>
    </div>
    </Link>
  );
}
