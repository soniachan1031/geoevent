import Link from "next/link";
import Image from "next/image";
import { IEvent } from "@/types/event.types";

interface EventCardProps {
  event: IEvent;
  link: string;
  horizontal?: boolean;
}

export default function EventCard({
  event,
  link,
  horizontal,
}: Readonly<EventCardProps>) {
  return (
    <Link href={link} className="group block w-full">
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 flex ${
          horizontal ? "flex-row" : "flex-col"
        }`}
      >
        {/* Event Image */}
        <Image
          src={event.image ?? "/logo.png"}
          alt={event.title}
          width={horizontal ? 150 : 300}
          height={horizontal ? 150 : 300}
          loading="lazy"
          className="object-cover group-hover:opacity-90 w-auto h-auto"
        />

        {/* Event Details */}
        <div className="p-4">
          <h2 className="text-xl text-nowrap font-semibold text-gray-900">{event.title}</h2>
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
