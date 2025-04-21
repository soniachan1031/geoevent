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
import {
  User,
  CalendarCheck,
  Clock,
  Users,
  Heart,
  SlidersHorizontal,
  LogOut,
  LayoutDashboard,
} from "lucide-react";


export default function ProfileDropdown() {
  const { user } = useAuthContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer transition-all hover:scale-105">
          <AvatarImage src={user?.photo?.url} className="rounded-full" />
          <AvatarFallback className="flex items-center justify-center text-muted-foreground">
            <FaUserCircle className="text-3xl" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-card shadow-xl rounded-xl shadow-lg"
      >
        {/* Header */}
        <DropdownMenuLabel className="px-5 pt-4 pb-2 text-muted-foreground text-sm font-semibold border-b border-border">
          My Account
        </DropdownMenuLabel>

        {/* Menu Items */}
        <div className="flex flex-col gap-1 py-3 px-2">
          {user?.role === EUserRole.ADMIN && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
              >
                <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                <span className="w-full">Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          {(user?.role === EUserRole.ADMIN || user?.role === EUserRole.ORGANIZER) && (
            <DropdownMenuItem asChild>
              <Link
                href="/organizer"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
              >
                <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                <span className="w-full">Organizer Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/my-registered-events"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <CalendarCheck className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">My Events</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/my-history"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">History</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/organizers"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">Organizers</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/my-following"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">Following</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/my-preferences"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="w-full">Preferences</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Logout Button */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="px-2 pb-3">
            <LogoutBtn />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  );
}
