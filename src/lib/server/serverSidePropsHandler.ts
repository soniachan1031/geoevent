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

/**
 * A higher-order function that handles server-side props for Next.js pages,
 * providing user authentication and authorization checks.
 *
 * @param {Object} params - The parameters for the handler.
 * @param {EUserRole | EAuthStatus} params.access - The required access level for the page.
 * @param {Function} [params.fn] - An optional function to execute if the user has access.
 * @param {GetServerSidePropsContext<ParsedUrlQuery, PreviewData>} params.fn.ctx - The context object provided by Next.js.
 * @param {IUser | null} params.fn.user - The authenticated user object or null if not authenticated.
 * @returns {GetServerSideProps} A function to be used as `getServerSideProps` in Next.js pages.
 *
 * @example
 * // Usage in a Next.js page
 * export const getServerSideProps = serverSidePropsHandler({
 *   access: EUserRole.ADMIN,
 *   fn: async (ctx, user) => {
 *     // Custom logic here
 *     return { props: { customData: 'example' } };
 *   },
 * });
 */
const serverSidePropsHandler = ({
  access,
  fn,
}: {
  access: EUserRole | EAuthStatus;
  fn?: (
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
    user: IUser | null
  ) => Promise<{ [key: string]: any } | void>;
}): GetServerSideProps => {
  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const user = await getUser(ctx.req.cookies[ECookieName.AUTH]);
    const hasAccess =
      access === EAuthStatus.ANY ||
      (user &&
        (user.role === EUserRole.ADMIN ||
          user.role === access ||
          access == EAuthStatus.AUTHENTICATED));
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

    if (!user && access != EAuthStatus.ANY) {
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
