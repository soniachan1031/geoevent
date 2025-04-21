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
import UpdateEventBtn from "@/components/buttons/UpdateEventBtn";
import DeleteEventBtn from "@/components/buttons/DeleteEventBtn";
import Image from "next/image";
import CustomPagination from "@/components/paginations/CustomPagination";
import { Pencil, Trash2 } from "lucide-react";

type TGetEventProps = {
  page?: number;
  limit?: number;
  search?: string;
};

const AdminDashboardEvents = () => {
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
      setLoading(true);
      // Fetch events data
      const res = await axiosInstance().get("api/events", {
        params: { page, limit, search, ticketMaster: false },
      });
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
          <div className="sm:hidden flex flex-col w-full gap-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex items-start justify-between gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                {/* Left Side: Image + Info */}
                <div className="flex items-start gap-4">
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
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {(event.date as string)?.slice(0, 10)} •{" "}
                      {typeof event.organizer === "object"
                        ? event.organizer?.name
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-3 text-muted-foreground text-[18px]">
                  <UpdateEventBtn
                    event={event}
                    variant="ghost"
                    requestUrl={`api/events/${event._id}`}
                    onSuccess={() => getEvents({})}
                    className="p-0 h-8 w-8 hover:bg-muted rounded-md transition"
                  >
                    <Pencil className="h-4 w-4" />
                  </UpdateEventBtn>

                  <DeleteEventBtn
                    variant="ghost"
                    className="p-0 h-8 w-8 hover:bg-muted rounded-md transition"
                    requestUrl={`api/events/${event._id}`}
                    onSuccess={() => getEvents({})}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </DeleteEventBtn>
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
                  <div className="text-gray-900 text-base font-medium truncate max-w-[200px]">
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

                  {/* Organizer */}
                  <div className="text-gray-700 text-sm truncate max-w-[150px]">
                    {typeof event.organizer === "object"
                      ? event.organizer?.name
                      : "Unknown"}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center justify-center gap-3">
                    <UpdateEventBtn
                      event={event}
                      variant="ghost"
                      requestUrl={`api/events/${event._id}`}
                      onSuccess={() => getEvents({})}
                      className="p-0 h-8 w-8 hover:bg-muted rounded-md"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </UpdateEventBtn>

                    <DeleteEventBtn
                      requestUrl={`api/events/${event._id}`}
                      onSuccess={() => getEvents({})}
                      variant="ghost"
                      className="p-0 h-8 w-8 hover:bg-muted rounded-md"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </DeleteEventBtn>
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

export default AdminDashboardEvents;

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
