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
    <div className="relative">
      <Button
        className="p-1 rounded-full w-8 h-8 flex items-center justify-center bg-white text-black hover:text-white"
        onClick={() => setExpand(!expand)}
      >
        <BsThreeDots />
      </Button>
      {expand && (
        <div className="grid gap-3 p-3 bg-white absolute top-10 right-0 z-10 shadow-lg rounded-lg">
          <Button variant="outline" className="w-full">
            <Link href={`/events/${event._id}/analytics`}>Analytics</Link>
          </Button>
          <UpdateEventBtn
            variant="outline"
            event={event}
            requestUrl={`api/events/${event._id}`}
            onSuccess={onEventUpdateSuccess}
          />
          {user && (
            <SendEmailBtn
              variant="outline"
              title="Send Email to pargicipants"
              requestUrl={`/api/events/${event._id}/send-email`}
              method={EApiRequestMethod.POST}
            ></SendEmailBtn>
          )}
          <DeleteEventBtn
            requestUrl={`api/events/${event._id}`}
            onSuccess={onDeleteSuccess}
            className="w-full"
          >
            Cancel Event
          </DeleteEventBtn>
        </div>
      )}
    </div>
  );
};

export default EventOrganizerDropdown;
