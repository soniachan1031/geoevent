import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosInstance";
import { LogOut } from "lucide-react";

export default function LogoutBtn() {
  const router = useRouter();
  const { authLoading, setAuthLoading, setUser } = useAuthContext();

  const initiateLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.stopPropagation();
      setAuthLoading(true);

      // send login request
      const Axios = axiosInstance();
      await Axios.delete("api/auth");

      setAuthLoading(false);

      // logout user
      setUser(null);
      toast.success("Logged out");
      // redirect to home
      if (router.pathname !== "/") router.push("/");
    } catch (error: any) {
      // handle error
      setAuthLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  return (
    <Button
  variant="secondary"
  onClick={initiateLogout}
  loading={authLoading}
  className="w-full px-4 py-3 rounded-b-xl text-sm"
>
  <span className="flex items-center justify-center gap-2 w-full">
    <LogOut className="w-4 h-4" />
    Logout
  </span>
</Button>

  

  );
}
