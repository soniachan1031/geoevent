import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { TPagination } from "@/types/api.types";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { GrPowerReset } from "react-icons/gr";
import { IEvent } from "@/types/event.types";
import Image from "next/image";
import CustomPagination from "@/components/paginations/CustomPagination";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import EventOrganizerDropdown from "@/components/EventOrganizerDropdown";

type TGetEventProps = {
  page?: number;
  limit?: number;
  search?: string;
};

const OrganizerDashboardEvents = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const eventsPerPage = 50;
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [events, setEvents] = useState<IEvent[]>([]);
  const [pagination, setPagination] = useState<TPagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const getEvents = async ({
    page = 1,
    limit = eventsPerPage,
    search = "",
  }: TGetEventProps) => {
    try {
      if (!user) return router.push("/login");
      setLoading(true);
      // Fetch events data
      const res = await axiosInstance().get(
        `/api/organizers/${user._id}/hosted-events`,
        {
          params: { page, limit, search },
        }
      );
      const { docs, pagination } = res.data.data;
      setEvents(docs);
      setPagination(pagination);
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents({});
  }, []);

  const setEvent = async (event: IEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((prevEvent) =>
        prevEvent._id === event._id ? event : prevEvent
      )
    );
  };

  return (
    <div className="grid gap-5 w-full md:min-w-[700px]">
      {loading ? (
        <div className="grid gap-3 w-full">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-8 lg:px-16 mx-auto">
          <div className="w-full max-w-screen-lg mx-auto mb-4">
            <Searchbar
              searchText={searchText}
              setSearchText={setSearchText}
              getEvents={getEvents}
            />
          </div>

          {/* 📱 MOBILE VERSION (Card Layout) */}
          <div className="sm:hidden flex flex-col bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event._id} className="p-4 flex items-center gap-4">
                {/* Event Image */}
                <div className="w-14 h-14 flex-shrink-0">
                  <Image
                    src={event.image ?? "/logo.png"}
                    alt={event.title}
                    width={56}
                    height={56}
                    className="rounded-lg shadow-md w-full h-full object-cover"
                  />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">{event.title}</p>
                  <p className="text-gray-600 text-sm truncate">
                    {(event.date as string)?.slice(0, 10)} •{" "}
                    {typeof event.organizer === "object"
                      ? event.organizer?.name
                      : "Unknown"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <EventOrganizerDropdown
                    event={event}
                    onEventUpdateSuccess={setEvent}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 🖥 DESKTOP TABLE */}
          <div className="hidden sm:block w-full max-w-screen-lg mx-auto mt-6 bg-white shadow-lg rounded-xl overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[10%_15%_15%_20%_15%_15%_10%] min-w-[900px] px-8 py-4 bg-gray-50 border-b text-gray-500 text-sm font-medium">
              <div className="text-left">Image</div>
              <div className="text-left">ID</div>
              <div className="text-left">Title</div>
              <div className="text-left">Category</div>
              <div className="text-left">Date</div>
              <div className="text-left">Organizer</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="grid grid-cols-[10%_15%_15%_20%_15%_15%_10%] min-w-[900px] items-center px-8 py-5 hover:bg-gray-50 transition-all ease-in-out"
                >
                  {/* Event Image */}
                  <div className="flex justify-left">
                    <Image
                      src={event.image ?? "/logo.png"}
                      alt={event.title}
                      width={50}
                      height={50}
                      className="rounded-lg shadow-md w-[50px] h-[50px] object-cover"
                    />
                  </div>

                  {/* Truncated ID */}
                  <div className="text-gray-700 text-sm truncate max-w-[100px]">
                    {event._id.slice(0, 10)}...
                  </div>

                  {/* Title */}
                  <div className="text-gray-900 text-base font-medium">
                    {event.title}
                  </div>

                  {/* Category */}
                  <div className="text-gray-700 text-sm">{event.category}</div>

                  {/* Date */}
                  <div className="text-gray-700 text-sm">
                    {(event.date as string)?.slice(0, 10)}
                  </div>

                  {/* Organizer (Truncated if Long) */}
                  <div className="text-gray-700 text-sm truncate max-w-[150px]">
                    {typeof event.organizer === "object"
                      ? event.organizer?.name
                      : "Unknown"}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-center">
                    <EventOrganizerDropdown
                      event={event}
                      onEventUpdateSuccess={setEvent}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CustomPagination
            paginationProps={pagination}
            onPageChange={(page) => getEvents({ page })}
          />
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardEvents;

const Searchbar: FC<{
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  getEvents: (props: TGetEventProps) => Promise<void>;
}> = ({ searchText, setSearchText, getEvents }) => {
  const reset = () => {
    setSearchText("");
    getEvents({});
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto flex gap-3">
      {/* Search Input & Button */}
      <div className="flex items-center border border-gray-300 rounded-lg shadow-md focus-within:shadow-lg transition w-full">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search Id or Event title..."
          className="py-2 px-4 rounded-l bg-white outline-none text-gray-700 w-full"
        />
        <Button
          className="rounded-l-none bg-gray-100 hover:bg-gray-200 px-4 transition"
          onClick={() => getEvents({ search: searchText })}
        >
          <CiSearch className="text-gray-600 text-lg" />
        </Button>
      </div>

      {/* Reset Button */}
      <Button
        onClick={reset}
        variant="outline"
        className="rounded-full h-9 w-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition"
      >
        <GrPowerReset className="text-gray-600 text-lg" />
      </Button>
    </div>
  );
};
