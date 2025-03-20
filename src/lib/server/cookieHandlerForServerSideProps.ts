import { ECookieName } from "@/types/api.types";
import { GetServerSidePropsContext } from "next";

/**
 * Removes the authentication cookie using the GetServersidePropsContext object.
 *
 * @param {GetServerSidePropsContext} context - The context object from getServerSideProps.
 * @return {void} This function does not return anything.
 */
export const removeAuthCookie = (context: GetServerSidePropsContext) => {
  context.res.setHeader(
    "Set-Cookie",
    `${ECookieName.AUTH}=; Max-Age=0; Path=/; HttpOnly`
  );
};
