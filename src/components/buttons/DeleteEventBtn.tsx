import { createRef, useState } from "react";
import { Button } from "../ui/button";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
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

type TDeletEventBtnProps = {
  requestUrl: string;
  children?: React.ReactNode;
  onSuccess?: () => Promise<void> | void;
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

const DeleteEventBtn: React.FC<TDeletEventBtnProps> = ({
  requestUrl,
  children,
  onSuccess,
  variant = "destructive",
  className,
}) => {
  const cancelBtnRef = createRef<HTMLButtonElement>();
  const [loading, setLoading] = useState(false);

  const handleEventDelete = async () => {
    try {
      setLoading(true);

      // delete event
      await axiosInstance().delete(requestUrl);

      setLoading(false);

      toast.success("Event Deleted");

      // close the dialog
      cancelBtnRef.current?.click();

      // call onSuccess callback
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: any) {
      // handle error
      setLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          className={className}
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          {children ?? "Delete Event"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently cancel and
            delete the event and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            loading={loading}
            loaderProps={{ color: "white" }}
            onClick={handleEventDelete}
          >
            Delete Event
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventBtn;
