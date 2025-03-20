import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";

const resetPasswordTemplate = ({
  passwordResetUrl,
  req,
}: {
  passwordResetUrl: string;
  req: IApiRequest;
}) => {
  return templateContainer({
    title: "Password Reset",
    content: `
              <div>
                <h3>Click here to reset your password: </h3>
                <a href=${passwordResetUrl} style="text-decoration: underline;">Reset Password</a>
              </div>
             `,
    req,
  });
};

export default resetPasswordTemplate;
