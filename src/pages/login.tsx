import LoginForm from "@/components/forms/LoginFom";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-100">
    {/* Login Container */}
    <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={80} height={80} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h1>
      <p className="text-sm text-gray-500 text-center mt-1">Log in to continue</p>

      {/* Login Form */}
      <div className="mt-8">
        <LoginForm />
      </div>

      {/* Links */}
      <div className="flex justify-between items-center mt-5 text-sm">
        <Link href="/forgot-password" className="text-gray-700 hover:underline">
          Forgot Password?
        </Link>
        <Link href="/register" className="text-gray-700 hover:underline">
          Register
        </Link>
      </div>
    </div>
  </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
