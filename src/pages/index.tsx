import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";
import extractDate from "@/lib/extractDate";
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
    setSearchOptions,
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
      <h1 className="text-3xl font-semibold">GeoEvent</h1>
      <div className="hidden md:flex flex-wrap gap-5 items-center justify-center">
        <select
          value={searchOptions.category ?? ""}
          onChange={(e) =>
            setSearchOptions((prev) => ({
              ...prev,
              category: e.target.value as EEventCategory,
            }))
          }
          className="p-1 rounded shadow"
        >
          <option value="">Category</option>
          {Object.values(EEventCategory).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={searchOptions.format ?? ""}
          onChange={(e) =>
            setSearchOptions((prev) => ({
              ...prev,
              format: e.target.value as EEventFormat,
            }))
          }
          className="p-1 rounded shadow"
        >
          <option value="">Format</option>
          {Object.values(EEventFormat).map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>

        <select
          value={searchOptions.language ?? ""}
          onChange={(e) =>
            setSearchOptions((prev) => ({
              ...prev,
              language: e.target.value as EEventLanguage,
            }))
          }
          className="p-1 rounded shadow"
        >
          <option value="">language</option>
          {Object.values(EEventLanguage).map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={searchOptions.dateFrom ?? ""}
          onChange={(e) =>
            setSearchOptions((prev) => ({
              ...prev,
              dateFrom: extractDate(e.target.value),
            }))
          }
          className="p-1 shadow"
        />

        <span className="text-black">To</span>

        <input
          type="date"
          value={searchOptions.dateTo ?? ""}
          onChange={(e) =>
            setSearchOptions((prev) => ({
              ...prev,
              dateTo: extractDate(e.target.value),
            }))
          }
          className="p-1 shadow"
        />
      </div>
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
          <div className="flex-1 flex flex-col md:flex-row gap-5 w-full">
            <div className="md:flex-1 block w-auto h-[500px] md:sticky md:top-[75px] bg-slate-500">
              <EventMap
                events={events}
                selectedEventId={selectedEventId}
                onMarkerClick={setSelectedEventId}
              />
            </div>
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
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-row overflow-hidden`}
      >
        {/* Event Image */}
        <img
          src={event.image ?? "/logo.png"}
          alt={event.title}
          className={`object-cover group-hover:opacity-90 aspect-square w-[150px]`}
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
};
