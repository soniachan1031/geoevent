import Link from "next/link";
import Image from "next/image";
import { IEvent } from "@/types/event.types";
import { format } from "date-fns";

interface EventCardProps {
  event: IEvent;
  link: string;
}

export default function EventCard({ event, link }: Readonly<EventCardProps>) {
  return (
    <Link href={link} className="group block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
        {/* Event Image */}
        {event.image && (
          <Image
            src={event.image}
            alt={event.title}
            width={300}
            height={300}
            priority={false}
            className="object-cover group-hover:opacity-90"
          />
        )}

        {/* Event Details */}
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
          <p className="text-sm text-gray-500">
            {format(new Date(event.date), "MMMM d, yyyy")} &bull;{" "}
            {event.category}
          </p>
        </div>
      </div>
    </Link>
  );
}
