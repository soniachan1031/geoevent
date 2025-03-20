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
    <div className="flex flex-col items-center min-h-screen gap-8 p-6">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-gray-900 border-b-2 pb-2">
        My History
      </h1>
  
      {/* Previously Registered Events */}
      <section className="w-full max-w-7xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Previously Registered Events
        </h2>
  
        {previouslyRegisteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg shadow">
            <p className="text-gray-600">No past registered events found.</p>
            <a
              href="/events"
              className="mt-3 text-blue-600 hover:underline font-medium"
            >
              Explore Upcoming Events →
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-5 place-items-center w-auto">
            {previouslyRegisteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
  
      {/* Ongoing Event Suggestions */}
      <section className="w-full max-w-7xl mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Event Suggestions for You
        </h2>
  
        {eventSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg shadow">
            <p className="text-gray-600">No ongoing events found.</p>
            <a
              href="/discover"
              className="mt-3 text-blue-600 hover:underline font-medium"
            >
              Discover New Events →
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-5 place-items-center w-auto">
            {eventSuggestions.map((event) => (
              <EventCard key={event._id} event={event} />
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
      previouslyRegisteredEvents: stringifyAndParse(previouslyRegisteredEvents),
      eventSuggestions: stringifyAndParse(eventSuggestions),
    };
  },
});
