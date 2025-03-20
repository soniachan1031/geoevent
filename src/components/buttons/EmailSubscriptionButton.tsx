import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import axiosInstance from "@/lib/axiosInstance";
import { IUser } from "@/types/user.types";
import { useState } from "react";

export default function EmailSubscriptionButton({
  subscribed,
}: Readonly<{
  subscribed: boolean | null | undefined;
}>) {
  const { setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const initiateLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.stopPropagation();
      setLoading(true);

      // send request
      const Axios = axiosInstance();
      const res = await Axios.patch("api/auth/preferences", {
        subscribeToEmails: !subscribed,
      });

      const { doc } = res.data.data as { doc: IUser };

      // update user in context
      setUser(doc);
      setLoading(false);

      toast.success(res.data.message ?? "Preferences updated successfully");
    } catch (error: any) {
      // handle error
      setLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  return (
    <Button
      variant={subscribed ? "destructive" : "default"}
      loading={loading}
      onClick={initiateLogout}
      loaderProps={{ color: "white" }}
    >
      {subscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
