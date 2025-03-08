import { CiSearch } from "react-icons/ci";
import { LuMapPin } from "react-icons/lu";
import SearchbarLocationInput from "./SearchbarLocationInput";
import {
  TEventSearchOptions,
  useEventSearchContext,
} from "@/context/EventSearchContext";
import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
} from "@/types/event.types";
import extractDate from "@/lib/extractDate";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { VscSettings } from "react-icons/vsc";
import { createRef, useState } from "react";

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
        <button type="submit">
          <CiSearch />
        </button>
        <input
          type="text"
          className="py-1 px-3 focus:outline-none flex-1 min-w-[100px]"
          placeholder="Search for an event..."
          value={search ?? ""}
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, search: e.target.value })
          }
        />
        <div className="md:hidden">
          <FilterBtn />
        </div>
        <span className="hidden md:block h-6 w-[1px] bg-gray-300 mx-1" />
        <div className="hidden md:flex items-center absolute md:static left-0 top-[calc(100%+10px)] bg-white md:bg-none shadow-md md:shadow-none rounded-lg p-2 md:p-0 w-full md:w-auto group-hover:flex">
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
        className="rounded-full bg-slate-800 text-white text-xl font-bold p-2 mt-1 sm:mt-0 hidden md:block"
      >
        <CiSearch />
      </button>
    </form>
  );
};

export default Searchbar;

function FilterBtn() {
  const cancelBtnRef = createRef<HTMLButtonElement>();
  const { searchOptions, setSearchOptions } = useEventSearchContext();

  const [options, setOptions] = useState<TEventSearchOptions>(searchOptions);

  const handleFilter = () => {
    setSearchOptions(options);
    // Close the dialog
    cancelBtnRef.current?.click();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full h-7 w-7 flex items-center justify-center"
          title="Generate event description"
        >
          <VscSettings />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Search Filter</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-wrap gap-5 items-center justify-center">
              <select
                value={options.category ?? ""}
                onChange={(e) =>
                  setOptions((prev) => ({
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
                value={options.format ?? ""}
                onChange={(e) =>
                  setOptions((prev) => ({
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
                value={options.language ?? ""}
                onChange={(e) =>
                  setOptions((prev) => ({
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
                value={options.dateFrom ?? ""}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    dateFrom: extractDate(e.target.value),
                  }))
                }
                className="p-1 shadow"
              />

              <span className="text-black">To</span>

              <input
                type="date"
                value={options.dateTo ?? ""}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    dateTo: extractDate(e.target.value),
                  }))
                }
                className="p-1 shadow"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
          <Button onClick={handleFilter}>Filter</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
