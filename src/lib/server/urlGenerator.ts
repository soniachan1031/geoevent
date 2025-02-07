import { IApiRequest } from "@/types/api.types";

export const getSiteURL = (req: IApiRequest) => {
  // Determine the protocol
  const protocol = req.headers.get("x-forwarded-proto") ?? "http";

  // Get the host from the headers
  const host = req.headers.get("host");

  // Construct the main URL
  const mainUrl = `${protocol}://${host}`;

  return mainUrl;
};

export const getLogoURL = (req: IApiRequest) => {
  return `${getSiteURL(req)}/logo.png`;
};

export const getLoginURL = (req: IApiRequest) => {
  return `${getSiteURL(req)}/login`;
};
