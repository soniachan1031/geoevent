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
    <div className="min-h-screen grid place-items-center p-3">
      <div className="grid gap-5 place-items-center">
        <Logo />
        {!token ? (
          <p>Invalid Link</p>
        ) : (
          <>
            <p>Reset Password</p>
            <ResetPasswordForm token={token} />
          </>
        )}
        <Link href="/login" className="underline">
          Login
        </Link>
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
