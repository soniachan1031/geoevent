import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
} from "@/types/event.types";
import extractDate from "@/lib/extractDate";
import { useEventSearchContext } from "@/context/EventSearchContext";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import EventCard from "@/components/EventCard";
import CustomPagination from "@/components/paginations/CustomPagination";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import EventMap from "@/components/maps/EventMap/EventMap";
import { useEffect, useRef, useState } from "react";

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
      <div className="flex gap-5 items-center">
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
          <div className="flex gap-5 w-full">
            <div className="flex-1 h-[500px] sticky top-[75px]">
              <EventMap
                events={events}
                selectedEventId={selectedEventId}
                onMarkerClick={setSelectedEventId}
              />
            </div>
            <div className="grid gap-5">
              {events.map((event) => (
                <div
                  key={event._id}
                  ref={(el) => {eventRefs.current[event._id] = el;}}
                  className={`p-2 rounded ${
                    selectedEventId === event._id ? "shadow-lg" : ""
                  }`}
                >
                  <EventCard
                    event={event}
                    link={`events/${event._id}`}
                    horizontal
                  />
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
