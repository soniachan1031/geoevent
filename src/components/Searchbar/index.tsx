import { CiSearch } from "react-icons/ci";
import { LuMapPin} from "react-icons/lu"

const Searchbar = () => {
  return (
    <div className="group rounded-full border px-2 py-1 flex items-center gap-1 transition-shadow duration-300 focus-within:shadow-lg focus-within:shadow-gray-400">
      <CiSearch />
      <input
        type="text"
        className="py-1 px-3 focus:outline-none"
        placeholder="Search for an event..."
      />
      <span className="h-6 block w-[1px] bg-gray-300"></span>
      <LuMapPin />
      <input
        type="text"
        className="py-1 px-3 focus:outline-none"
        placeholder="Location..."
      />
      <button className="rounded-full bg-slate-800 text-white text-xl font-bold p-2">
        <CiSearch />
      </button>
    </div>
  );
};

export default Searchbar;
