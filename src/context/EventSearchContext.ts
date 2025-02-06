import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";
import { TSearchLocation } from "@/types/location.types";
import { createContext, useContext } from "react";

export type TEventSearchOptions = {
  search?: string;
  location?: TSearchLocation;
  dateFrom?: string;
  dateTo?: string;
  category?: EEventCategory;
  format?: EEventFormat;
  language?: EEventLanguage;
  page?: number;
  limit?: number;
};

export type TEventSearchPagination = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type TEventSearchContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  searchOptions: TEventSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<TEventSearchOptions>>;
  events: IEvent[];
  setEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
  searchEvents: (searchOptions?: TEventSearchOptions) => Promise<void>;
  pagination: TEventSearchPagination;
  setPagination: React.Dispatch<React.SetStateAction<TEventSearchPagination>>;
};

const EventSearchContext = createContext<TEventSearchContext>({
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  searchOptions: {},
  setSearchOptions: () => {},
  events: [],
  setEvents: () => {},
  searchEvents: async () => {},
  pagination: { total: 0, totalPages: 0, page: 1, limit: 30 },
  setPagination: () => {},
});

export const useEventSearchContext = () => useContext(EventSearchContext);

export default EventSearchContext;
