import {
  IEvent,
} from "@/types/event.types";
import { useEventSearchContext } from "@/context/EventSearchContext";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import CustomPagination from "@/components/paginations/CustomPagination";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import EventMap from "@/components/maps/EventMap/EventMap";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export const metadata = {
  title: "GeoEvent",
  description: "GeoEvent - Coming soon!",
};

export default function Home() {
  const {
    loading,
    searchOptions,
    events,
    pagination,
    searchEvents,
  } = useEventSearchContext();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Create a ref map to store references to event cards
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedEventId && eventRefs.current[selectedEventId]) {
      eventRefs.current[selectedEventId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedEventId]);

  // When the page changes
  const handlePageChange = (page: number) => {
    const newSearchOptions = { ...searchOptions, page };
    searchEvents(newSearchOptions);
  };

  return (
    <div className="flex flex-col items-center min-h-screen gap-5 w-full">
      {loading ? (
        <div className="flex flex-col gap-5 w-full">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col gap-5 w-full">
          {/* Map Section */}
<div className="w-full h-[500px] bg-gray-100 rounded-xl shadow-md border border-gray-200 overflow-hidden">
  <EventMap
    events={events}
    selectedEventId={selectedEventId}
    onMarkerClick={setSelectedEventId}
  />
</div>

            {/* Event Cards Section */}
            <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-5 place-items-center w-auto">
              {events.map((event) => (
                <div
                  key={event._id}
                  ref={(el) => {
                    eventRefs.current[event._id] = el;
                  }}
                  className={`w-full p-2 rounded max-h-max ${
                    selectedEventId === event._id ? "shadow-lg" : ""
                  }`}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
            
          </div>
          <CustomPagination
            paginationProps={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});

const EventCard = ({ event }: Readonly<{ event: IEvent }>) => {
  const link = `events/${event._id}`;

  return (
    <Link href={link} className="group block w-full">
          <div className="w-full flex justify-center">
      <div
        className="shadow-md srounded-lg hover:shadow-lg transition duration-300 
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
};
