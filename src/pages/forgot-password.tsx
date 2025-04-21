import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen px-6 bg-background">
    {/* Forgot Password Container */}
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-card text-card-foreground  p-10 rounded-2xl shadow-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={50} height={50} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-foreground">Forgot Password?</h1>
      <p className="text-sm text-muted-foreground text-center mt-1">
        Enter your email to receive a reset link.
      </p>

      {/* Forgot Password Form */}
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      {/* Login Redirect */}
      <p className="text-sm text-center mt-5 text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Back to Login
        </Link>
      </p>
    </div>
  </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
