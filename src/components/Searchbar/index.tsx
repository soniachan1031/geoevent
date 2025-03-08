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
      className="group flex items-center gap-1 w-full md:max-w-[450px] 
                 rounded-full border px-2 py-1 transition-shadow duration-300 
                 focus-within:shadow-lg focus-within:shadow-gray-400 group"
    >
      <div className="flex flex-1 items-center relative">
        <CiSearch />
        <input
          type="text"
          className="py-1 px-3 focus:outline-none flex-1 min-w-[100px]"
          placeholder="Search for an event..."
          value={search ?? ""}
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, search: e.target.value })
          }
        />
        <span className="hidden md:block h-6 w-[1px] bg-gray-300 mx-1" />
        <div className="hidden md:flex items-center absolute md:static left-0 top-[calc(100%+10px)] bg-white md:bg-none shadow-md md:shadow-none rounded-lg p-2 md:p-0 w-full md:w-auto group-hover:flex" >
          <LuMapPin />

          <div className="flex-1 min-w-[120px] md:max-w-[200px]">
            <SearchbarLocationInput
              value={location}
              onChange={(loc) =>
                setSearchOptions({ ...searchOptions, location: loc })
              }
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-slate-800 text-white text-xl font-bold p-2 mt-1 sm:mt-0"
      >
        <CiSearch />
      </button>
    </form>
  );
};

export default Searchbar;
