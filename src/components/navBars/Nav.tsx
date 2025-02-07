import Link from "next/link";
import Logo from "../Logo";
import Searchbar from "../Searchbar";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa6";
import ProfileDropdown from "../ProfileDropdown";
import { useAuthContext } from "@/context/AuthContext";

export default function Nav() {
  const { user } = useAuthContext();
  return (
    <nav className="bg-white p-3 sticky top-0 z-50 shadow-md">
      <div className="flex gap-5 items-center">
        <Link href="/">
          <Logo height={30} width={30} />
        </Link>
        <div className="flex flex-1 justify-center items-center gap-5">
          <Searchbar />
          <Link href="/create-event">
            <Button tabIndex={-1}>
              <div className="flex items-center gap-3">
                <span>Create Event</span> <FaPlus />
              </div>
            </Button>
          </Link>
        </div>
        {user ? (
          <ProfileDropdown />
        ) : (
          <div className="flex justify-center items-center gap-5">
            <Link href="/login">
              <Button tabIndex={-1} variant="secondary">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button tabIndex={-1} variant="secondary">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
