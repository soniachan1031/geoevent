export const MONGO_URI = process.env.MONGO_URI as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY = process.env
  .AWS_SECRET_ACCESS_KEY as string;
export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET as string;

export const GOOGLE_MAPS_API_KEY = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
export const GOOGLE_MAPS_MAP_ID = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string;

export const MAIL_SMTP_HOST = process.env.MAIL_SMTP_HOST as string;
export const MAIL_SMTP_PORT = process.env.MAIL_SMTP_PORT as string;

export const MAIL_SMTP_USERNAME = process.env.MAIL_SMTP_USERNAME as string;
export const MAIL_SMTP_PASSWORD = process.env.MAIL_SMTP_PASSWORD as string;

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

export const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY as string;

export const TICKETMASTER_PHONE = "1-800-653-8000";
export const TICKETMASTER_EMAIL_lINK =
  "https://help.ticketmaster.ca/hc/en-us/requests/new";

export const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY!;
