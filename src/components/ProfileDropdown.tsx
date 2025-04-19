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
import { EUserRole } from "@/types/user.types";

export default function ProfileDropdown() {
  const { user } = useAuthContext();
  const canHaveFollowers =
    user?.role === EUserRole.ORGANIZER || user?.role === EUserRole.ADMIN;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer transition-all hover:scale-105">
          <AvatarImage src={user?.photo?.url} className="rounded-full" />
          <AvatarFallback className="flex items-center justify-center bg-gray-200 text-gray-600">
            <FaUserCircle className="text-3xl" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-white shadow-xl rounded-lg overflow-hidden"
      >
        {/* Header */}
        <DropdownMenuLabel className="px-4 py-2 text-gray-700 text-sm font-semibold border-b">
          My Account
        </DropdownMenuLabel>

        {/* Menu Items */}
        <div className="py-2">
          {user?.role === EUserRole.ADMIN && (
            <DropdownMenuItem className="group">
              <Link
                href="/admin"
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
              >
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="group">
            <Link
              href="/profile"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Link
              href="/my-hosted-events"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              My Events
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Link
              href="/my-preferences"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              Preferences
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Link
              href="/my-history"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Link
              href="/organizers"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              Organizers
            </Link>
          </DropdownMenuItem>
          {canHaveFollowers && (
            <DropdownMenuItem className="group">
              <Link
                href="/my-followers"
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
              >
                Followers
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="group">
            <Link
              href="/my-following"
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded"
            >
              Following
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Logout Button - Separated for Emphasis */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => e.preventDefault()} className="p-0">
          <div className="w-full text-center py-2 text-white rounded transition">
            <LogoutBtn />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
