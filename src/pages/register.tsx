import RegisterForm from "@/components/forms/RegisterForm";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-100">
    {/* Register Container */}
    <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={80} height={80} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-gray-900">Create an Account</h1>
      <p className="text-sm text-gray-500 text-center mt-1">Join us today</p>

      {/* Register Form */}
      <div className="mt-8">
        <RegisterForm />
      </div>

      {/* Login Redirect */}
      <p className="text-sm text-center mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-gray-700 hover:underline font-semibold">
          Login
        </Link>
      </p>
    </div>
  </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
