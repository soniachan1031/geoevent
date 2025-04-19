import stringifyAndParse from "@/lib/stringifyAndParse";
import { IEvent } from "@/types/event.types";
import { GetServerSideProps } from "next";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import { ECookieName } from "@/types/api.types";
import SavedEvent from "@/mongoose/models/SavedEvent";
import EventRegistration from "@/mongoose/models/EventRegistration";
import { getServerSidePropsSiteUrl } from "@/lib/server/urlGenerator";
import getEvent from "@/lib/server/getEvent";
import EventPage from "@/components/EventPage/Index";

type EventPageProps = {
  event: IEvent;
  user: any;
  saved: boolean;
  registered: boolean;
  shareUrl: string;
};

const EventDetailPage: React.FC<EventPageProps> = (props) => {
  return <EventPage {...props} />;
};

export default EventDetailPage;

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  req,
  resolvedUrl,
}) => {
  // connect db
  await connectDB();

  const user = await getUser(req.cookies[ECookieName.AUTH]);

  // find event by id
  const event = await getEvent(id as string);

  if (!event) {
    return {
      notFound: true,
    };
  }

  // check if user already saved the event
  const savedEvent = event.external
    ? false
    : await SavedEvent.findOne({
        user: user?._id,
        event: event._id,
      }).select("_id");

  // check if user is already registered for the event
  const registeredEvent = event.external
    ? false
    : await EventRegistration.findOne({
        user: user?._id,
        event: event._id,
      }).select("_id");

  const shareUrl = getServerSidePropsSiteUrl(req) + resolvedUrl;

  return {
    props: {
      user: stringifyAndParse(user),
      event: stringifyAndParse(event),
      saved: !!savedEvent,
      registered: !!registeredEvent,
      shareUrl,
    } as EventPageProps,
  };
};
