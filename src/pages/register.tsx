import RegisterForm from "@/components/forms/RegisterForm";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function Register() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen px-6 bg-background">
    {/* Register Container */}
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-card text-card-foreground  p-10 rounded-2xl shadow-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={50} height={50} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-foreground">Create an Account</h1>
      <p className="text-sm text-muted-foreground text-center mt-1">Join us today</p>

      {/* Register Form */}
      <div className="mt-8">
        <RegisterForm />
      </div>

      {/* Login Redirect */}
      <p className="text-sm text-center mt-5 text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-semibold">
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
