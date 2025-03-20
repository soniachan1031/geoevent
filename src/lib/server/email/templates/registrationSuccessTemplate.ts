import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { IUser } from "@/types/user.types";
import { getSiteURL } from "../../urlGenerator";

const registrationSuccessTemplate = ({
  user,
  req,
}: {
  user: IUser;
  req: IApiRequest;
}) => {
  return templateContainer({
    title: "Registration Successful",
    content: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Welcome to Our Service, ${
                  user.name
                }!</h2>
                <p>Dear ${user.name},</p>
                <p>Thank you for registering with us. We are excited to have you on board.</p>
                <p>You can now access your profile and start using our services.</p>
                <p>
                  <a href="${getSiteURL(
                    req
                  )}/profile" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">View My Profile</a>
                </p>
                <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
                <p>Best regards,<br/>GeoEvent Team</p>
              </div>  
             `,
    req,
  });
};

export default registrationSuccessTemplate;
