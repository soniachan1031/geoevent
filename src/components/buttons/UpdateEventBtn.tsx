import { useState } from "react";
import { Button } from "../ui/button";
import { IEvent } from "@/types/event.types";
import { EApiRequestMethod } from "@/types/api.types";
import EventForm from "../forms/events/EventForm";
import CustomModal from "../modals/CustomModal";

type TUpdateEventBtnProps = {
  event: IEvent;
  requestUrl: string;
  children?: React.ReactNode;
  onSuccess?: (event: IEvent) => Promise<void> | void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null;
  className?: string;
};

const UpdateEventBtn: React.FC<TUpdateEventBtnProps> = ({
  event,
  requestUrl,
  children,
  onSuccess,
  variant = "secondary",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const onUpdateComplete = async (updatedEvent: IEvent) => {
    if (onSuccess) await onSuccess(updatedEvent);
    handleClose();
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {children ?? "Update Event"}
      </Button>

      <CustomModal isOpen={isOpen} onClose={handleClose} title="Update Event">
        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          <EventForm
            event={event}
            onSuccess={onUpdateComplete}
            requestUrl={requestUrl}
            requestMethod={EApiRequestMethod.PATCH}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default UpdateEventBtn;
