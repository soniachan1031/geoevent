
import EventCard from "@/components/EventCard";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import stringifyAndParse from "@/lib/stringifyAndParse";
import Event from "@/mongoose/models/Event";
import { IEvent } from "@/types/event.types";
import { EAuthStatus } from "@/types/user.types";
import Link from "next/link";
import { useRouter } from "next/router";



export default function MyHostedEvents({
  events,
}: Readonly<{ events: IEvent[] }>) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 w-full">
      <h1 className="text-3xl">My Hosted Events</h1>
      <div className="flex justify-center my-6">
            <div className="flex bg-white p-1 rounded-full shadow-md">
               {/* Registered Events */}
               <Link
                href="/my-registered-events"
                className={`px-6 py-2 rounded-full transition ${
                  router.pathname === "/my-registered-events"
                    ? "bg-black text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Registered
              </Link>
      
               {/* Saved Events */}
               <Link
                href="/my-saved-events"
                className={`px-6 py-2 rounded-full transition ${
                  router.pathname === "/my-saved-events"
                    ? "bg-black text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Saved
              </Link>
              {/* Hosted Events */}
              <Link
                href="/my-hosted-events"
                className={`px-6 py-2 rounded-full transition ${
                  router.pathname === "/my-hosted-events"
                    ? "bg-black text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hosted
              </Link>
            </div>
          </div>
      {events.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t hosted any events yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-5 place-items-center w-full">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
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

    const events = await Event.find({ organizer: user._id });

    return { events: stringifyAndParse(events) };
  },
});
