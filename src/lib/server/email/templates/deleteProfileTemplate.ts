import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { IUser } from "@/types/user.types";
import { getSiteURL } from "../../urlGenerator";

const deleteProfileTemplate = ({
  user,
  req,
}: {
  user: IUser;
  req: IApiRequest;
}) => {
  const content = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #FF0000;">Profile Deletion Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>We are writing to confirm that your profile has been successfully deleted from our system.</p>
          <p>If this was a mistake or if you have any questions, please contact our support team immediately.</p>
          <p>If you wish to rejoin our community in the future, you can always create a new profile by visiting our website:</p>
          <p>
            <a href="${getSiteURL(
              req
            )}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Visit GeoEvent</a>
          </p>
          <p>Thank you for being a part of our community.</p>
          <p>Best regards,<br/>GeoEvent Team</p>
        </div>`;
  return templateContainer({
    title: "Profile Deleted",
    content,
    req,
  });
};

export default deleteProfileTemplate;
