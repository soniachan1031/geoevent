import CustomPagination from "@/components/paginations/CustomPagination";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { TPagination } from "@/types/api.types";
import { MdEdit, MdDelete } from "react-icons/md";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { GrPowerReset } from "react-icons/gr";
import { IEvent } from "@/types/event.types";
import UpdateEventBtn from "@/components/buttons/UpdateEventBtn";
import DeleteEventBtn from "@/components/buttons/DeleteEventBtn";
import { formatMinutes } from "@/lib/formatHandler";

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
        params: { page, limit, search },
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
        <div className="grid gap-5">
          <Searchbar
            searchText={searchText}
            setSearchText={setSearchText}
            getEvents={getEvents}
          />
          <div className="w-full overflow-auto">
            <table className="bg-white rounded shadow-md">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Id</th>
                  <th className="p-2">Title</th>
                  <th>Category</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th>Duration</th>
                  <th>Registration Deadline</th>
                  <th className="p-2">Organizer</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Format</th>
                  <th className="p-2">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="border-b">
                    <td className="p-2">
                      <div className="w-20 overflow-hidden text-ellipsis">
                        {event._id}
                      </div>
                    </td>
                    <td className="p-2">{event.title}</td>
                    <td>{event.category}</td>
                    <td className="p-2">
                      {(event.date as string).slice(0, 10)}
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        name="eventTime"
                        id="eventTime"
                        disabled
                        value={event.time}
                      />
                    </td>
                    <td>{event.duration && formatMinutes(event.duration)}</td>
                    <td>
                      {(event.registrationDeadline as string).slice(0, 10)}
                    </td>
                    <td className="p-2">
                      {event.organizer && typeof event.organizer === "object"
                        ? event.organizer.name
                        : "null"}
                    </td>
                    <td className="p-2">{event.location.address}</td>
                    <td className="p-2">{event.format}</td>
                    <td className="p-2">{event.capacity}</td>
                    <td className="flex gap-2 p-2">
                      <UpdateEventBtn
                        event={event}
                        variant="secondary"
                        className="p-2"
                        requestUrl={`api/events/${event._id}`}
                        onSuccess={() => getEvents({})}
                      >
                        <MdEdit />
                      </UpdateEventBtn>
                      <DeleteEventBtn
                        variant="secondary"
                        className="p-2 text-red-500"
                        requestUrl={`api/events/${event._id}`}
                        onSuccess={() => getEvents({})}
                      >
                        <MdDelete />
                      </DeleteEventBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    <div className="flex gap-5 items-center">
      <div className="flex max-w-max overflow-hidden rounded shadow-md focus-within:shadow-lg transition">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search Id or Event title..."
          className="py-1 px-3 rounded-l"
        />
        <Button
          className="rounded-l-none h-full"
          onClick={() => getEvents({ search: searchText })}
        >
          <CiSearch />
        </Button>
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="rounded-full h-8 w-8"
      >
        <GrPowerReset />
      </Button>
    </div>
  );
};
