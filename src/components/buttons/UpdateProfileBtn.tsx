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
import { IUser } from "@/types/user.types";
import { EApiRequestMethod } from "@/types/api.types";
import ProfileForm from "../forms/ProfileForm";

type TUpdateProfileBtnProps = {
  user: IUser;
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

const UpdateProfileBtn: React.FC<TUpdateProfileBtnProps> = ({
  user,
  requestUrl,
  children,
  onSuccess,
  variant = "secondary",
  className,
}) => {
  const cancelBtnRef = createRef<HTMLButtonElement>();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className={className}>
          {children ?? "Update Profile"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Profile</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="overflow-auto max-h-[calc(100vh-200px)]">
              <ProfileForm
                user={user}
                onSuccess={onSuccess}
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
export default UpdateProfileBtn;
