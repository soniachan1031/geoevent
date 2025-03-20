import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-100">
    {/* Forgot Password Container */}
    <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={80} height={80} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-gray-900">Forgot Password?</h1>
      <p className="text-sm text-gray-500 text-center mt-1">
        Enter your email to receive a reset link.
      </p>

      {/* Forgot Password Form */}
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      {/* Login Redirect */}
      <p className="text-sm text-center mt-5">
        <Link href="/login" className="text-gray-700 hover:underline font-semibold">
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
