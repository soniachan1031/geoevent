import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import EventCard from "@/components/EventCard";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import stringifyAndParse from "@/lib/stringifyAndParse";
import Event from "@/mongoose/models/Event";
import { IEvent } from "@/types/event.types";
import { EAuthStatus } from "@/types/user.types";

export default function MyHostedEvents({
  events,
}: Readonly<{ events: IEvent[] }>) {
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <CustomBreadcrumb
        links={[
          { text: "Home", href: "/" },
        ]}
        currentPage="My Hosted Events"
      />
      <h1 className="text-3xl">My Hosted Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t hosted any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
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

    const events = await Event.find({ organizer: user._id });

    return { events: stringifyAndParse(events) };
  },
});
