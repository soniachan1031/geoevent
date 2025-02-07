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
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
const DeleteProfileBtn: React.FC<{
  onSuccess?: () => Promise<void> | void;
}> = ({ onSuccess }) => {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const handleProfileDelete = async () => {
    try {
      setLoading(true);
      // delete event
      const res = await axiosInstance().delete(`api/auth/me`);
      setLoading(false);
      // logout user
      setUser(null);
      toast.success(res.data.message ?? "Profile Deleted");
      // call onSuccess callback
      if (onSuccess) {
        await onSuccess();
      }
      // redirect to home
      router.push("/");
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
          Delete Profile
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleProfileDelete()} asChild>
            <Button variant="destructive" loading={loading}>
              Delete Profile
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteProfileBtn;
