import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { IUser } from "@/types/user.types";
import { getSiteURL } from "../../urlGenerator";

const emailSubscriptionTemplate = ({
  user,
  req,
}: {
  user: IUser;
  req: IApiRequest;
}) => {
  const subscribed = user.subscribeToEmails;

  const content = subscribed
    ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #4CAF50;">Subscription Confirmed, ${user.name}!</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for subscribing to our email notifications. You will now receive updates and news from us.</p>
          <p>You can change your email preferences at any time by clicking the link below:</p>
          <p>
            <a href="${getSiteURL(
              req
            )}/my-preferences" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Manage My Preferences</a>
          </p>
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          <p>Best regards,<br/>GeoEvent Team</p>
        </div>
      `
    : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #4CAF50;">Subscription Update, ${user.name}!</h2>
          <p>Dear ${user.name},</p>
          <p>You have successfully unsubscribed from our email notifications. You will no longer receive updates and news from us.</p>
          <p>You can change your email preferences at any time by clicking the link below:</p>
          <p>
            <a href="${getSiteURL(
              req
            )}/my-preferences" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Manage My Preferences</a>
          </p>
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          <p>Best regards,<br/>GeoEvent Team</p>
        </div>
      `;

  return templateContainer({
    title: subscribed ? "Subscription Confirmed" : "Subscription Update",
    content,
    req,
  });
};

export default emailSubscriptionTemplate;
