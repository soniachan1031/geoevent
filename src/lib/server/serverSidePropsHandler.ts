import { ECookieName } from "@/types/api.types";
import { EAuthStatus, EUserRole, IUser } from "@/types/user.types";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import getUser from "./getUser";
import { ParsedUrlQuery } from "querystring";
import stringifyAndParse from "../stringifyAndParse";
import { removeAuthCookie } from "./cookieHandlerForServerSideProps";

const serverSidePropsHandler = ({
  access,
  fn,
}: {
  access: EUserRole | EAuthStatus;
  fn?: (
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
    user: IUser | null
  ) => Promise<{ [key: string]: any } | void>;
}) => {
  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const user = await getUser(ctx.req.cookies[ECookieName.AUTH]);
    const hasAccess =
      user &&
      (user.role === EUserRole.ADMIN ||
        user.role === access ||
        access == EAuthStatus.AUTHENTICATED);
    let redirectPath = "/";

    if (!user) {
      redirectPath = "/login";
    } else if (user.disabled) {
      removeAuthCookie(ctx);
      redirectPath = "/login";
    }

    const handleRedirect = () => ({
      redirect: { destination: redirectPath, permanent: true },
    });

    if (access === EAuthStatus.UNAUTHENTICATED) {
      return !user
        ? { props: (await fn?.(ctx, user)) || {} }
        : handleRedirect();
    }

    if (!user) {
      return handleRedirect();
    }

    return hasAccess
      ? {
          props: {
            user: stringifyAndParse(user),
            ...((await fn?.(ctx, user)) || {}),
          },
        }
      : handleRedirect();
  };

  return getServerSideProps;
};

export default serverSidePropsHandler;
