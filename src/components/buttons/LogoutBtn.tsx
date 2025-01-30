import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosInstance";

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
    <Button variant="secondary" loading={authLoading} onClick={initiateLogout}>
      Logout
    </Button>
  );
}
