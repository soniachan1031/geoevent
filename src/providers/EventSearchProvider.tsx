import EventSearchContext, {
  TEventSearchContext,
  TEventSearchOptions,
  TEventSearchPagination,
} from "@/context/EventSearchContext";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { IEvent } from "@/types/event.types";
import { useRouter } from "next/router";
import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

function EventSearchProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOptions, setSearchOptions] = useState<TEventSearchOptions>({});
  const [events, setEvents] = useState<IEvent[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 30,
  });

  const searchEvents: TEventSearchContext["searchEvents"] = useCallback(
    async (newSearchOptions) => {
      try {
        // Set loading and error to null
        setLoading(true);
        setError(null);

        // navigate to homepage if not already there
        if (router.pathname !== "/") {
          await router.push("/");
        }

        // Fetch events using searchOptions

        const options = newSearchOptions ?? searchOptions;

        // copy location object
        const location = { ...options.location };

        // remove location from options
        delete options.location;

        // flatten and merge location with options
        const modifiedOptions = {
          ...options,
          ...location,
        };

        // Fetch events
        const res = await axiosInstance().get("api/events", {
          params: modifiedOptions,
        });

        const { docs, pagination } = (await res.data.data) as {
          docs: IEvent[];
          pagination: TEventSearchPagination;
        };

        // Set events and pagination
        setEvents(docs);
        setPagination(pagination);
      } catch (error) {
        setError(getErrorMsg(error));
        toast.error(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    },
    [router, searchOptions]
  );

  // Debounce `fetchEvents` with `useEffect`
  useEffect(() => {
    if (router.pathname !== "/") return; // Fetch only if on the homepage

    const handler = setTimeout(() => {
      searchEvents(searchOptions);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler); // Cleanup function to clear timeout
  }, [searchOptions, searchEvents, router.pathname]);

  const state = useMemo(
    () =>
      ({
        loading,
        setLoading,
        error,
        setError,
        searchOptions,
        setSearchOptions,
        events,
        setEvents,
        searchEvents,
        pagination,
        setPagination,
      } as TEventSearchContext),
    [loading, error, searchOptions, events, searchEvents, pagination]
  );
  return (
    <EventSearchContext.Provider value={state}>
      {children}
    </EventSearchContext.Provider>
  );
}

export default EventSearchProvider;
