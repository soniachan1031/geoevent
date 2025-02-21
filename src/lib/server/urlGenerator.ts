import { IApiRequest } from "@/types/api.types";
import { GetServerSidePropsContext } from "next";

export const getSiteURL = (req: IApiRequest) => {
  // Determine the protocol
  const protocol = req.headers.get("x-forwarded-proto") ?? "http";

  // Get the host from the headers
  const host = req.headers.get("host");

  // Construct the main URL
  const mainUrl = `${protocol}://${host}`;

  return mainUrl;
};

export const getServerSidePropsSiteUrl = (
  req: GetServerSidePropsContext["req"]
) => {
  // Determine the protocol
  const protocol = req.headers["x-forwarded-proto"] ?? "http";

  // Get the host from the headers
  const host = req.headers.host;

  // Construct the main URL
  const mainUrl = `${protocol}://${host}`;

  return mainUrl;
};

export const getServerSidePropsFullUrl = (
  req: GetServerSidePropsContext["req"]
) => {
  return `${getServerSidePropsSiteUrl(req)}${req.url}`;
};

export const getLogoURL = (req: IApiRequest) => {
  return `${getSiteURL(req)}/logo.png`;
};

export const getLoginURL = (req: IApiRequest) => {
  return `${getSiteURL(req)}/login`;
};
