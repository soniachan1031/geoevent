import Link from "next/link";
import Logo from "../Logo";
import Searchbar from "../Searchbar";
import { Button } from "../ui/button";
import ProfileDropdown from "../ProfileDropdown";
import { useAuthContext } from "@/context/AuthContext";
import { CalendarPlus } from "lucide-react";

/**
 * A responsive Nav component:
 * - On small screens, the search bar and "Create Event" button
 *   stack below the logo.
 * - On medium+ screens, items line up in a single row.
 */
export default function Nav() {
  const { user } = useAuthContext();
  return (
    <nav className="bg-white p-1 md:p-3 sticky top-0 z-50 shadow-md">
    <div className="flex flex-wrap items-center justify-between gap-1 md:gap-3">
      
      {/* Left: Logo */}
      <Link href="/">
        <Logo height={30} width={30} />
      </Link>

      <div className="relative"></div>

      {/* Mobile: Create + Login */}
      <div className="flex md:hidden items-center gap-3 mt-2 md:mt-0">
        <Link href="/create-event" className="shrink-0">
          <Button>
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" />
              <span>Create Event</span>
            </div>
          </Button>
        </Link>
        {user ? (
          <ProfileDropdown />
        ) : (
          <Link href="/login">
            <Button variant="secondary">
              <div className="flex items-center gap-2">
                
                <span>Login</span>
              </div>
            </Button>
          </Link>
        )}
      </div>

      {/* Middle: Searchbar */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
        <div className="flex-1 min-w-[180px]">
          <Searchbar />
        </div>
      </div>

      {/* Desktop: Create + Login/Profile */}
      <div className="hidden md:flex items-center gap-3 mt-2 md:mt-0">
        <Link href="/create-event" className="shrink-0 hidden md:block">
          <Button>
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" />
              <span>Create Event</span>
            </div>
          </Button>
        </Link>

        {user ? (
          <ProfileDropdown />
        ) : (
          <Link href="/login">
            <Button variant="secondary">
              <div className="flex items-center gap-2">
                
                <span>Login</span>
              </div>
            </Button>
          </Link>
        )}
      </div>
    </div>
  </nav>
  );
}
