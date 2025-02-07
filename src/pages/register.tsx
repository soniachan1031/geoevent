import RegisterForm from "@/components/forms/RegisterForm";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-5">
      <Image alt="logo" src="/logo.png" width={70} height={70} />
      <h1 className="text-3xl">Register</h1>
      <RegisterForm />
      <p>
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.UNAUTHENTICATED,
});
