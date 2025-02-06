import { IApiRequest } from "@/types/api.types";
import templateContainer from "./emailBodyTemplateContainer";
import { IEvent } from "@/types/event.types";

const eventSuccessTemplate = ({
  subject,
  url,
  event,
  req,
}: {
  subject: string;
  url: string;
  event: IEvent;
  req: IApiRequest;
}) => {
  return templateContainer({
    title: subject,
    content: `
              <div>
                <h3>${subject}</h3>
                <h4>Event Details</h4>
                <p><strong>Title:</strong> ${event.title}</p>
                <p><strong>Location:</strong> ${event.location.address}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                ${
                  event.time
                    ? `<p><strong>Time:</strong> ${event.time}</p>`
                    : ""
                }

                <h4>For full details:</h4>
                <a href=${url} style="text-decoration: underline;">See full details</a>
              </div>
             `,
    req,
  });
};

export default eventSuccessTemplate;
