import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useAuthContext } from "@/context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import LogoutBtn from "./buttons/LogoutBtn";

export default function ProfileDropdown() {
  const { user } = useAuthContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.photo?.url} />
          <AvatarFallback className="flex items-center justify-center">
            <FaUserCircle className="text-3xl" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/my-hosted-events">Hosted Events</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/my-saved-events">Saved Events</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.preventDefault()}>
          <Link href="/my-preferences">Preferences</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.preventDefault()}>
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
