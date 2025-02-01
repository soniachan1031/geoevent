import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen grid place-items-center p-3">
      <div className="grid gap-5 place-items-center">
        <Logo />
        <p>Forgot Password</p>
        <ForgotPasswordForm />
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
