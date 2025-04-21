import LoginForm from "@/components/forms/LoginFom";
import Logo from "@/components/Logo";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";

export default function Login() {
  return (
<div className="w-full flex flex-col items-center justify-center min-h-screen px-6 bg-background">
  {/* Login Container */}
  <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-card text-card-foreground p-10 rounded-xl shadow-xl">
    {/* Logo */}
    <div className="flex justify-center mb-6">
      <Logo width={50} height={50} />
    </div>

    {/* Heading */}
    <h1 className="text-2xl font-bold text-center text-foreground">Welcome Back</h1>
    <p className="text-sm text-muted-foreground text-center mt-1">Log in to continue</p>

    {/* Login Form */}
    <div className="mt-8">
      <LoginForm />
    </div>

    {/* Links */}
    <div className="flex justify-between items-center mt-5 text-sm">
      <Link
        href="/forgot-password"
        className="text-muted-foreground hover:text-foreground hover:underline transition"
      >
        Forgot Password?
      </Link>
      <Link
        href="/register"
        className="text-muted-foreground hover:text-foreground hover:underline transition"
      >
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
