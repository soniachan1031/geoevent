import Link from "next/link";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/types/event.types";
import { EApiRequestMethod } from "@/types/api.types";
import { useAuthContext } from "@/context/AuthContext";

import { Button } from "./ui/button";
import UpdateEventBtn from "./buttons/UpdateEventBtn";
import DeleteEventBtn from "./buttons/DeleteEventBtn";
import SendEmailBtn from "./buttons/SendEmailBtn";
import { BarChart3, Mail, Pencil, Trash2, MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type TEventOrganizerDropdownProps = {
  event: IEvent;
  onEventUpdateSuccess?: (event: IEvent) => Promise<void> | void;
  variant?: "inline" | "dropdown"; // default is inline
};

const EventOrganizerDropdown: FC<TEventOrganizerDropdownProps> = ({
  event,
  onEventUpdateSuccess,
  variant = "inline",
}) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const onDeleteSuccess = () => {
    router.push("/");
  };

  // 🔁 DROPDOWN VERSION
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-muted rounded-md"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 py-1 bg-white border border-border rounded-md shadow-lg"
        >
          {/* View Analytics */}
          <DropdownMenuItem
            className="block w-full px-4 py-2 text-sm text-center text-foreground hover:bg-muted rounded-md transition"
            asChild
          >
            <Link href={`/events/${event._id}/analytics`}>View Analytics</Link>
          </DropdownMenuItem>

          {/* Edit Event */}
          <DropdownMenuItem asChild>
            <UpdateEventBtn
              event={event}
              variant="ghost"
              requestUrl={`api/events/${event._id}`}
              onSuccess={onEventUpdateSuccess}
              className="block w-full px-4 py-2 text-sm text-center text-foreground hover:bg-muted rounded-md transition"
            >
              Edit Event
            </UpdateEventBtn>
          </DropdownMenuItem>

          {/* Send Email */}
          {user && (
            <DropdownMenuItem asChild>
              <SendEmailBtn
                variant="ghost"
                title="Email Participants"
                requestUrl={`/api/events/${event._id}/send-email`}
                method={EApiRequestMethod.POST}
                className="block w-full px-4 py-2 text-sm text-center text-foreground hover:bg-muted rounded-md transition"
              >
                Send Email
              </SendEmailBtn>
            </DropdownMenuItem>
          )}

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          {/* Cancel Event */}
          <DropdownMenuItem asChild>
            <DeleteEventBtn
              variant="ghost"
              requestUrl={`api/events/${event._id}`}
              onSuccess={onDeleteSuccess}
              className="block w-full px-4 py-2 text-sm text-center text-destructive hover:bg-red-50 rounded-md transition"
            >
              Cancel Event
            </DeleteEventBtn>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // ---------------------------------
  // ✅ INLINE VERSION (default)
  // ---------------------------------
  return (
    <div className="flex items-center gap-2">
      <Link href={`/events/${event._id}/analytics`} title="Analytics">
        <Button size="icon" variant="ghost">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </Link>

      <UpdateEventBtn
        event={event}
        variant="ghost"
        className="p-0 h-8 w-8"
        requestUrl={`api/events/${event._id}`}
        onSuccess={onEventUpdateSuccess}
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </UpdateEventBtn>

      {user && (
        <SendEmailBtn
          variant="ghost"
          title="Email Participants"
          className="p-0 h-8 w-8"
          requestUrl={`/api/events/${event._id}/send-email`}
          method={EApiRequestMethod.POST}
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
        </SendEmailBtn>
      )}

      <DeleteEventBtn
        variant="ghost"
        className="p-0 h-8 w-8"
        requestUrl={`api/events/${event._id}`}
        onSuccess={onDeleteSuccess}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </DeleteEventBtn>
    </div>
  );
};

export default EventOrganizerDropdown;
