import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { IUser } from "@/types/user.types";

const resetPasswordTemplate = ({
  passwordResetUrl,
  req,
  user,
}: {
  passwordResetUrl: string;
  req: IApiRequest;
  user: IUser;
}) => {
  return templateContainer({
    title: "Password Reset",
    content: `
      <div>
        <p>Dear ${user.name},</p>
        <h3>You requested a password reset.</h3>
        <p>Please click the link below to reset your password:</p>
        <a href="${passwordResetUrl}" style="text-decoration: underline;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
    req,
  });
};

export default resetPasswordTemplate;
