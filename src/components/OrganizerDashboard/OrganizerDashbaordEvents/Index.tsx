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
          <div className="mt-4 sm:hidden flex flex-col bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event._id} className="p-4 flex items-start gap-4">
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

                {/* Event Info + Actions */}
                <div className="flex-1 flex flex-col gap-2 justify-between">
                  {/* Title */}
                  <div>
                    <p className="text-gray-900 font-semibold">{event.title}</p>
                    <p className="text-gray-500 text-sm">
                      {(event.date as string)?.slice(0, 10)}
                    </p>
                  </div>

                  {/* Action Icons */}
                  <div className="flex gap-4 text-muted-foreground text-[18px] mt-2">
                    <EventOrganizerDropdown
                      event={event}
                      onEventUpdateSuccess={setEvent}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥 DESKTOP TABLE */}

          <div className="hidden sm:block w-full max-w-screen-lg mx-auto mt-6 bg-white shadow-lg rounded-xl overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[10%_15%_25%_15%_15%_20%] min-w-[900px] px-8 py-4 bg-gray-50 border-b text-gray-500 text-sm font-medium">
              <div className="text-left">Image</div>
              <div className="text-left">ID</div>
              <div className="text-left">Title</div>
              <div className="text-left">Category</div>
              <div className="text-left">Date</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="grid grid-cols-[10%_15%_25%_15%_15%_20%] min-w-[900px] items-center px-8 py-5 hover:bg-gray-50 transition-all ease-in-out"
                >
                  {/* Image */}
                  <div className="flex justify-left">
                    <Image
                      src={event.image ?? "/logo.png"}
                      alt={event.title}
                      width={50}
                      height={50}
                      className="rounded-lg shadow-md w-[50px] h-[50px] object-cover"
                    />
                  </div>

                  {/* ID */}
                  <div className="text-gray-700 text-sm truncate max-w-[100px]">
                    {event._id.slice(0, 10)}...
                  </div>

                  {/* Title */}
                  <div className="text-gray-900 text-base font-medium">
                    {event.title}
                  </div>

                  {/* Category */}
                  <div className="text-gray-700 text-sm capitalize">
                    {event.category}
                  </div>

                  {/* Date */}
                  <div className="text-gray-700 text-sm">
                    {(event.date as string)?.slice(0, 10)}
                  </div>

                  {/* Actions (icon-based, already handled) */}
                  <div className="flex gap-4 justify-center text-muted-foreground text-[18px]">
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
    <div className="w-full max-w-screen-lg mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
    <div className="relative w-full flex items-center border border-primary/40 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary">
      {/* Search Input */}
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search Id or Event title..."
        className="w-full py-2 pl-4 pr-20 text-sm bg-transparent outline-none rounded-lg text-gray-700 placeholder:text-muted-foreground"
      />
  
      {/* Divider Line */}
      <div className="absolute right-12 top-2 bottom-2 w-px bg-border" />
  
      {/* Icon Buttons */}
      <div className="absolute right-2 flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="p-1 hover:bg-muted"
          onClick={() => getEvents({ search: searchText })}
          type="button"
        >
          <CiSearch className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="p-1 hover:bg-muted"
          onClick={reset}
          type="button"
        >
          <GrPowerReset className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  </div>
  
  
  );
};
