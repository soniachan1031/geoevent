import { EUserRole } from "@/types/user.types";

import AppError from "../AppError";
import { ECookieName, IApiRequest } from "@/types/api.types";
import getUser from "../getUser";
import { cookies } from "next/headers";

/**
 * Guards access to routes based on user roles.
 *
 * @param req - The request object.
 * @param access - The role(s) that are allowed to access the route. full access for super admin. leave empty for allowing logged in user.
 * @throws AppError - If the user is not authenticated or if the user does not have the required role.
 * @returns - The authenticated user and injects it to the request object.
 */
export const guard = async (
  req: IApiRequest,
  access?: EUserRole | EUserRole[]
) => {
  const user = await getUser((await cookies()).get(ECookieName.AUTH)?.value);

  if (!user) {
    throw new AppError(401, "unauthorized");
  }

  // check if user is disabled
  if (user.disabled) {
    throw new AppError(401, "unauthorized");
  }

  // check if user has access (full access for admin)
  if (access && user.role !== EUserRole.ADMIN) {
    if (Array.isArray(access)) {
      if (!access.includes(user.role as EUserRole)) {
        throw new AppError(403, "forbidden");
      }
    } else if (access !== user.role) {
      throw new AppError(403, "forbidden");
    }
  }
  // inject user to request
  req.user = user;

  return user;
};
