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

  const handlePageChange = (page: number) => {
    const newSearchOptions = { ...searchOptions, page };
    searchEvents(newSearchOptions);
  };

  return (
    <div className="flex flex-col items-center  min-h-screen gap-5">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                link={`events/${event._id}`}
              />
            ))}
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
