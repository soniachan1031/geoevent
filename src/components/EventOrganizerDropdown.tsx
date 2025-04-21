import Link from "next/link";
import { Button } from "./ui/button";
import { BsThreeDots } from "react-icons/bs";
import { FC, useState } from "react";
import { IEvent } from "@/types/event.types";
import UpdateEventBtn from "./buttons/UpdateEventBtn";
import DeleteEventBtn from "./buttons/DeleteEventBtn";
import { useRouter } from "next/navigation";
import SendEmailBtn from "./buttons/SendEmailBtn";
import { EApiRequestMethod } from "@/types/api.types";
import { useAuthContext } from "@/context/AuthContext";
import { BarChart3, Mail, Pencil, Trash2 } from "lucide-react";

const EventOrganizerDropdown: FC<{
  event: IEvent;
  onEventUpdateSuccess?: (event: IEvent) => Promise<void> | void;
}> = ({ event, onEventUpdateSuccess }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [expand, setExpand] = useState(false);

  // callback function to be called after event is deleted
  const onDeleteSuccess = () => {
    router.push("/");
  };
  return (
    <div className="flex items-center gap-2">
    {/* View Analytics */}
    <Link href={`/events/${event._id}/analytics`} title="Analytics">
      <Button size="icon" variant="ghost">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </Link>

    {/* Edit */}
    <UpdateEventBtn
      event={event}
      variant="ghost"
      className="p-0 h-8 w-8"
      requestUrl={`api/events/${event._id}`}
      onSuccess={onEventUpdateSuccess}
    
    >
      <Pencil className="h-4 w-4 text-muted-foreground" />
    </UpdateEventBtn>

    {/* Send Email */}
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

    {/* Delete */}
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
