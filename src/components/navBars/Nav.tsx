import Link from "next/link";
import Logo from "../Logo";
import Searchbar from "../Searchbar";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa6";
import ProfileDropdown from "../ProfileDropdown";
import { useAuthContext } from "@/context/AuthContext";

/**
 * A responsive Nav component:
 * - On small screens, the search bar and "Create Event" button
 *   stack below the logo.
 * - On medium+ screens, items line up in a single row.
 */
export default function Nav() {
  const { user } = useAuthContext();
  return (
    <nav className="bg-white p-3 sticky top-0 z-50 shadow-md">
      {/**
       * flex-wrap allows items to wrap on small screens;
       * justify-between splits logo on the left, profile or login on the right.
       * gap-3 provides spacing between items.
       */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo */}
        <Link href="/">
          <Logo height={30} width={30} />
        </Link>
        <div className="flex md:hidden items-center gap-3 mt-2 md:mt-0">
          <Link href="/create-event" className="shrink-0">
            <Button>
              <div className="flex items-center gap-2">
                <span>Create Event</span> <FaPlus className="hidden md:block" size={14} />
              </div>
            </Button>
          </Link>
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </>
          )}
        </div>
        {/**
         * Middle: Search bar + "Create Event" button
         * On small screens, these can wrap onto a new line.
         */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          {/* Searchbar grows/shrinks to fill available space on mobile */}
          <div className="flex-1 min-w-[180px]">
            <Searchbar />
          </div>

          {/* "Create Event" button. On mobile, it sits below or next to the search bar depending on space */}
          <Link href="/create-event" className="shrink-0 hidden md:block">
            <Button>
              <div className="flex items-center gap-2">
                <span>Create Event</span> <FaPlus size={14} />
              </div>
            </Button>
          </Link>
        </div>

        {/* Right: Profile or Login/Register */}
        <div className="hidden md:flex items-center gap-3 mt-2 md:mt-0">
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
