import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createRef } from "react";
import { EApiRequestMethod } from "@/types/api.types";
import EventForm from "../forms/events/EventForm";
import { IEvent } from "@/types/event.types";

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
  const cancelBtnRef = createRef<HTMLButtonElement>();

  const onUpdateComplete = async (event: IEvent) => {
    if (onSuccess) {
      await onSuccess(event);
    }
    cancelBtnRef.current?.click();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className={className}>
          {children ?? "Update Event"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Profile</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="overflow-auto max-h-[calc(100vh-200px)]">
              <EventForm
                event={event}
                onSuccess={onUpdateComplete}
                requestUrl={requestUrl}
                requestMethod={EApiRequestMethod.PATCH}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex justify-center w-full">
            <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default UpdateEventBtn;
