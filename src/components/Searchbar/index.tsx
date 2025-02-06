import { CiSearch } from "react-icons/ci";
import { LuMapPin } from "react-icons/lu";
import SearchbarLocationInput from "./SearchbarLocationInput";
import { useEventSearchContext } from "@/context/EventSearchContext";

const Searchbar = () => {
  const { searchOptions, searchEvents, setSearchOptions } =
    useEventSearchContext();

  const { search, location } = searchOptions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchEvents();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group rounded-full border px-2 py-1 flex items-center gap-1 transition-shadow duration-300 focus-within:shadow-lg focus-within:shadow-gray-400"
    >
      <CiSearch />
      <input
        type="text"
        className="py-1 px-3 focus:outline-none"
        placeholder="Search for an event..."
        value={search ?? ""}
        onChange={(e) =>
          setSearchOptions({ ...searchOptions, search: e.target.value })
        }
      />
      <span className="h-6 block w-[1px] bg-gray-300"></span>
      <LuMapPin />
      <SearchbarLocationInput
        value={location}
        onChange={(locationData) =>
          setSearchOptions({
            ...searchOptions,
            location: locationData,
          })
        }
      />
      <button
        type="submit"
        className="rounded-full bg-slate-800 text-white text-xl font-bold p-2"
      >
        <CiSearch />
      </button>
    </form>
  );
};

export default Searchbar;
