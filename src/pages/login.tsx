import LoginForm from "@/components/forms/LoginFom";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-5">
      <Logo width={70} height={70} />
      <h1 className="text-3xl">Login</h1>
      <LoginForm />
      <Link href="/forgot-password" className="underline">
        Forgot Password?
      </Link>
      <Link href="/register" className="underline">
        Register
      </Link>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
