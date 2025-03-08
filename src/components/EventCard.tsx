import Link from "next/link";
import Image from "next/image";
import { IEvent } from "@/types/event.types";

interface EventCardProps {
  event: IEvent;
  horizontal?: boolean;
}

export default function EventCard({
  event,
  horizontal,
}: Readonly<EventCardProps>) {
  const link = event.external ? event.url ?? "/" : `events/${event._id}`;

  return (
    <Link href={link} target="_blank" className="group block w-full">
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 flex ${
          horizontal ? "flex-col md:flex-row" : "flex-col"
        }`}
      >
        {/* Event Image */}
        <Image
          src={event.image ?? "/logo.png"}
          alt={event.title}
          width={300}
          height={300}
          loading="lazy"
          className={`object-cover group-hover:opacity-90 aspect-square  ${
            horizontal ? "w-full md:max-w-[150px] " : "w-full"
          }`}
        />

        {/* Event Details */}
        <div className="p-4">
          <div className="max-w-[200px]">
            <h2 className="text-xl font-semibold text-gray-900 break-words">
              {event.title}
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(event.date).toLocaleDateString("en-US", {
              timeZone: "UTC",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            &bull; {event.category}
          </p>
        </div>
      </div>
    </Link>
  );
}
