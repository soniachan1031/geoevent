import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import EventCard from "@/components/EventCard";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import stringifyAndParse from "@/lib/stringifyAndParse";
import EventRegistration from "@/mongoose/models/EventRegistration";
import { IEvent } from "@/types/event.types";
import { EAuthStatus } from "@/types/user.types";

export default function MyRegisteredEvents({
  events,
}: Readonly<{ events: IEvent[] }>) {
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <CustomBreadcrumb
        links={[{ text: "Home", href: "/" }]}
        currentPage="My Registered Events"
      />
      <h1 className="text-3xl">My Registered Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t registered for any events yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              link={`/events/${event._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
  fn: async (_, user) => {
    if (!user) return {};

    const eventRegistrations = await EventRegistration.find({
      user: user._id,
    }).populate("event");

    return {
      events: stringifyAndParse(eventRegistrations.map((er) => er.event)),
    };
  },
});
