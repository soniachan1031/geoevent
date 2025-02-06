import { ECookieName } from "@/types/api.types";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
/**
 * Retrieves the value of a cookie with the given name.
 *
 * @param name - The name of the cookie to retrieve.
 * @return The value of the cookie, or null if the cookie is not found or has expired.
 */
export const getCookieValue = async (name: ECookieName) => {
  try {
    const value = (await cookies()).get(name)?.value;
    if (value === undefined) {
      return null;
    }
    return jwt.verify(value, process.env.JWT_SECRET as string) as string;
  } catch {
    return null;
  }
};

/**
 * Sets a cookie with the given name and value.
 *
 * @param name - The name of the cookie.
 * @param value - The value to be stored in the cookie.
 * @param sessionOnly - If true, the cookie will expire upon browser close. Defaults to false.
 * @return This function does not return anything.
 */
export const setCookie = async (
  name: ECookieName,
  value: string,
  sessionOnly = false
) => {
  const data = jwt.sign(value, process.env.JWT_SECRET as string);
  (await cookies()).set(name, data, {
    maxAge: sessionOnly ? undefined : 60 * 60 * 24 * 7,
    sameSite: true,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
};

/**
 * Removes cookie with the given name.
 *
 * @return This function does not return anything.
 */
export const removeCookie = async (name: ECookieName): Promise<void> => {
  (await cookies()).delete(name);
};

/**
 * Sets an authentication cookie with the provided data that expires upon browser close.
 * @param {string} data - The data to be stored in the cookie.
 */
export const setAuthCookie = async (data: string) => {
  await setCookie(ECookieName.AUTH, data);
};

/**
 * Removes the authentication cookie.
 */
export const removeAuthCookie = async () => {
  await removeCookie(ECookieName.AUTH);
};
