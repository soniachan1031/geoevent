import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";
import EventRegistration from "@/mongoose/models/EventRegistration";
import Event from "@/mongoose/models/Event";
import stringifyAndParse from "@/lib/stringifyAndParse";
import EventCard from "@/components/EventCard";

interface IMyHistoryProps {
  previouslyRegisteredEvents: any[]; // or a typed array if you have a TS interface
  eventSuggestions: any[];
}

export default function MyHistory({
  previouslyRegisteredEvents,
  eventSuggestions,
}: Readonly<IMyHistoryProps>) {
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <h1 className="text-3xl font-semibold">My History</h1>

      {/* Previously Registered */}
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-3">
          Previously Registered Events
        </h2>
        {previouslyRegisteredEvents.length === 0 ? (
          <p>No past registered events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl ">
            {previouslyRegisteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
              />
            ))}
          </div>
        )}
      </section>

      {/* Ongoing Event Suggestions */}
      <section className="w-full mt-8">
        <h2 className="text-xl font-bold mb-3">Event Suggestions</h2>
        {eventSuggestions.length === 0 ? (
          <p>No ongoing events found matching your past categories.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
            {eventSuggestions.map((event) => (
              <EventCard
                key={event._id}
                event={event}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
  fn: async (ctx, user) => {
    if (!user) {
      return {};
    }
    // 1) Fetch the user’s previously registered events
    //    We'll populate the event details, or get the event IDs
    const registrations = await EventRegistration.find({ user: user._id })
      .populate("event")
      .lean();

    // This returns an array of registrations, each with an "event" object.
    // If you only want the unique list of events, you might transform them:
    const previouslyRegisteredEvents = registrations.map((reg) => reg.event);

    // 2) Collect categories from these events
    const categories = [
      ...new Set(
        previouslyRegisteredEvents.map((ev: any) => ev.category).filter(Boolean)
      ),
    ];

    // 3) Find ongoing events in any of those categories
    //    Ongoing means event.date >= now. Adjust logic to your definition of “ongoing.”
    let eventSuggestions: Event[] = [];
    if (categories.length > 0) {
      eventSuggestions = await Event.find({
        category: { $in: categories },
        date: { $gte: new Date() },
      });
    }

    // 4) Pass these arrays as props
    return {
      user: stringifyAndParse(user),
      previouslyRegisteredEvents: stringifyAndParse(previouslyRegisteredEvents),
      eventSuggestions: stringifyAndParse(eventSuggestions),
    };
  },
});
