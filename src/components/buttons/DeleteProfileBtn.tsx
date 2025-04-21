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
import { createRef, useState } from "react";

type TDeleteProfileBtnProps = {
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

const DeleteProfileBtn: React.FC<TDeleteProfileBtnProps> = ({
  requestUrl,
  children,
  onSuccess,
  className,
}) => {
  const cancelBtnRef = createRef<HTMLButtonElement>();
  const [loading, setLoading] = useState(false);
  const handleProfileDelete = async () => {
    try {
      setLoading(true);
      // delete user
      const res = await axiosInstance().delete(requestUrl);
      setLoading(false);

      toast.success(res.data.message ?? "Profile Deleted");

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
          variant="ghost"
          className={
            className ??
            "text-destructive hover:underline hover:bg-transparent focus-visible:ring-0"
          }
        >
          {children ?? "Permanently delete my account"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            profile.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            loading={loading}
            loaderProps={{ color: "white" }}
            onClick={handleProfileDelete}
          >
            Delete my account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteProfileBtn;
