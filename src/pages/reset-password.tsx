import Logo from "@/components/Logo";
import getUser from "@/lib/server/getUser";
import { ECookieName } from "@/types/api.types";
import { GetServerSideProps } from "next";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/credentials";
import User from "@/mongoose/models/User";
import connectDB from "@/lib/server/connectDB";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

export default function Page({ token }: Readonly<{ token: string }>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background">
    {/* Reset Password Container */}
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-card text-card-foreground p-10 rounded-2xl shadow-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo width={50} height={50} />
      </div>

      {/* Conditional Heading */}
      {!token ? (
        <p className="text-xl font-semibold text-center text-destructive">Invalid or expired reset link</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Enter a new password</p>

          {/* Reset Password Form */}
          <div className="mt-8">
            <ResetPasswordForm token={token} />
          </div>
        </>
      )}

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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  await connectDB();

  // check if user is logged in
  const loggedInUser = await getUser(req.cookies[ECookieName.AUTH]);

  if (loggedInUser) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // check if token is valid
  const { token } = query;

  if (!token) return { props: {} };
  // verify token
  let verifiedToken;
  try {
    verifiedToken = jwt.verify(token as string, JWT_SECRET);
    if (
      !verifiedToken ||
      typeof verifiedToken !== "object" ||
      !verifiedToken.id
    ) {
      return { props: {} };
    }
  } catch {
    return {
      props: {},
    };
  }

  // check if user with id exists
  const user = await User.findById(verifiedToken.id).select(
    "passwordResetToken passwordResetExpires"
  );

  if (!user) return { props: {} };

  // check if password reset token matches
  if (user.passwordResetToken !== token) return { props: {} };

  // check if password reset token has expired
  if (!user.passwordResetExpires) return { props: {} };

  if (user.passwordResetExpires < new Date()) return { props: {} };

  return {
    props: {
      token,
    },
  };
};
