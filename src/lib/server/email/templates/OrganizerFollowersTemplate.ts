import { IUser } from "@/types/user.types";
import { IApiRequest } from "@/types/api.types";
import { IEvent } from "@/types/event.types";
import templateContainer from "./emailBodyTemplateContainer";

const organizerFollowersTemplate = ({
  subject,
  text,
  organizer,
  req,
  event,
}: {
  subject: string;
  text: string;
  organizer: IUser;
  req: IApiRequest;
  event?: IEvent;
}) => {
  const eventTime = event?.time
    ? `<p><strong>Time:</strong> ${event.time}</p>`
    : "";

  let eventDetails = "";
  if (event) {
    eventDetails = `
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 8px;">Event Details</h4>
        <p><strong>Title:</strong> ${event.title}</p>
        ${eventTime}
        <p><strong>Date:</strong> ${event.date}</p>
        ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ""}
      </div>
    `;
  }

  const organizerPhoto = organizer.photo?.url
    ? `<div style="margin: 10px 0;">
         <img src="${organizer.photo.url}" alt="${organizer.name}" width="100" height="100" style="border-radius: 50%; object-fit: cover;" />
       </div>`
    : "";

  return templateContainer({
    title: subject,
    content: `
      <div>
        <p>Hello,</p>
        <h3>${subject}</h3>
        ${organizerPhoto}
        <p><strong>From:</strong> ${organizer.name}</p>
        <div style="margin-top: 10px;">
          <p>${text}</p>
        </div>
        ${eventDetails}
      </div>
    `,
    req,
  });
};

export default organizerFollowersTemplate;
