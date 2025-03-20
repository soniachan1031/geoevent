import { IApiRequest } from "@/types/api.types";
import { getLogoURL } from "../../urlGenerator";

const emailBodyTemplateContainer = ({
  title,
  content,
  req,
}: {
  title: string;
  content: string;
  req: IApiRequest;
}) => {
  const logoUrl = getLogoURL(req);
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
        <table width="100%" cellspacing="0" cellpadding="0" style="width: 100%; height: 100%; text-align: center;">
          <tr>
            <td align="center" valign="top">
              <table width="600" cellspacing="0" cellpadding="0" style="background: #fff; padding: 20px; margin: 20px auto;">
                <tr >
                  <td style="text-align: center; padding-bottom: 10px;">
                    <img
                      src="${logoUrl}" 
                      alt="GeoEvent logo" 
                      title="GeoEvent logo" 
                      style="display: block; margin: 0 auto;" 
                      width="127"
                      height="200"
                    />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default emailBodyTemplateContainer;
