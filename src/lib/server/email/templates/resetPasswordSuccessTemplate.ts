import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { getLoginURL } from "../../urlGenerator";

const resetPasswordSuccessTemplate = ({ req }: { req: IApiRequest }) => {
  const loginUrl = getLoginURL(req);
  return templateContainer({
    title: "Password Reset Success",
    content: `
              <div>
                <h3>Your password has been reset successfully. </h3>
                <h3>Click here to login: </h3>
                <a href=${loginUrl} style="text-decoration: underline;">Login</a>   
              </div>
             `,
    req,
  });
};

export default resetPasswordSuccessTemplate;
