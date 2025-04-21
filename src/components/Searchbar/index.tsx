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
  className="group flex items-center gap-2 w-full md:max-w-[500px] rounded-full border border-border bg-input px-4 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring transition"
>
  {/* Search Icon (left, hidden on md) */}
  <button type="submit" className="text-muted-foreground md:hidden">
    <CiSearch />
  </button>

  {/* Search Input */}
  <input
    type="text"
    className="bg-transparent flex-1 px-2 py-1 focus:outline-none text-foreground placeholder:text-muted-foreground"
    placeholder="Search events"
    value={search ?? ""}
    onChange={(e) =>
      setSearchOptions({ ...searchOptions, search: e.target.value })
    }
  />

  {/* Filter Button */}
  <div className="pl-2 border-l border-border">
    <FilterBtn />
  </div>

  {/* Location Input (hidden on mobile) */}
  <div className="hidden md:flex items-center gap-2 border-l pl-3">
    <LuMapPin className="text-muted-foreground" />
    <div className="flex-1 min-w-[100px] md:max-w-[200px]">
      <SearchbarLocationInput
        value={location}
        onChange={(loc) =>
          setSearchOptions({ ...searchOptions, location: loc })
        }
      />
    </div>
  </div>

  {/* Search Button (desktop only) */}
  <button
    type="submit"
    className="hidden md:block rounded-full bg-border hover:bg-primary text-foreground hover:text-primary-foreground transition p-2"
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

{/** Search Filter Dialog */}
<AlertDialogContent>
  <AlertDialogHeader>
    <AlertDialogTitle>Search Filter</AlertDialogTitle>
    <AlertDialogDescription>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">

        {/* Category */}
        <select
          value={options.category ?? ""}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              category: e.target.value as EEventCategory,
            }))
          }
          className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        >
          <option value="">Category</option>
          {Object.values(EEventCategory).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Format */}
        <select
          value={options.format ?? ""}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              format: e.target.value as EEventFormat,
            }))
          }
          className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        >
          <option value="">Format</option>
          {Object.values(EEventFormat).map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>

        {/* Language */}
        <select
          value={options.language ?? ""}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              language: e.target.value as EEventLanguage,
            }))
          }
          className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        >
          <option value="">Language</option>
          {Object.values(EEventLanguage).map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={options.dateFrom ?? ""}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              dateFrom: extractDate(e.target.value),
            }))
          }
          className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />

        {/* Date To */}
        <input
          type="date"
          value={options.dateTo ?? ""}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              dateTo: extractDate(e.target.value),
            }))
          }
          className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
      </div>
    </AlertDialogDescription>
  </AlertDialogHeader>

  <AlertDialogFooter className="pt-4">
    <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
    <Button onClick={handleFilter}>Filter</Button>
  </AlertDialogFooter>
</AlertDialogContent>

    </AlertDialog>
  );
}
