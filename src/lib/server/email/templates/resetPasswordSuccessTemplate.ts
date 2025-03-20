import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { getLoginURL } from "../../urlGenerator";
import { IUser } from "@/types/user.types";

const resetPasswordSuccessTemplate = ({
  req,
  user,
}: {
  req: IApiRequest;
  user: IUser;
}) => {
  const loginUrl = getLoginURL(req);

  return templateContainer({
    title: "Password Reset Success",
    content: `
      <div>
        <p>Dear ${user.name},</p>
        <h3>Your password has been reset successfully.</h3>
        <h4>Click below to log in:</h4>
        <a href="${loginUrl}" style="text-decoration: underline;">Login</a>
      </div>
    `,
    req,
  });
};

export default resetPasswordSuccessTemplate;
