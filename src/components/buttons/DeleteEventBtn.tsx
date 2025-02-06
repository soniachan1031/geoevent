import { useState } from "react";
import { Button } from "../ui/button";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeleteEventBtn: React.FC<{
  eventId: string;
  onSuccess?: () => Promise<void> | void;
}> = ({ eventId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleEventDelete = async () => {
    try {
      setLoading(true);

      // delete event
      await axiosInstance().delete(`api/events/${eventId}`);

      setLoading(false);

      toast.success("Event Deleted");

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
          variant="destructive"
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          Cancel Event
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleEventDelete()} asChild>
            <Button variant="destructive" loading={loading}>
              Cancel Event
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventBtn;
