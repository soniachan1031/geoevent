import EventCard from "@/components/EventCard";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import EventRegistration from "@/mongoose/models/EventRegistration";
import { ECookieName } from "@/types/api.types";
import { IEvent } from "@/types/event.types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

export default function MyRegisteredEvents({
  events,
}: Readonly<{ events: IEvent[] }>) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 w-full">
  <h1 className="text-3xl text-foreground font-semibold">My Events</h1>

  {/* Toggle Tabs */}
  <div className="flex justify-center my-6">
    <div className="flex bg-white p-1 rounded-full shadow-sm border border-border">
      {/* Registered Tab */}
      <Link
        href="/my-registered-events"
        className={`px-6 py-2 rounded-full text-sm font-medium transition ${
          router.pathname === "/my-registered-events"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        Registered
      </Link>

      {/* Saved Tab */}
      <Link
        href="/my-saved-events"
        className={`px-6 py-2 rounded-full text-sm font-medium transition ${
          router.pathname === "/my-saved-events"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        Saved
      </Link>
    </div>
  </div>

  {/* Registered Events List */}
  {events.length === 0 ? (
    <p className="text-muted-foreground">
      You haven&apos;t registered for any events yet.
    </p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  )}
</div>

  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();

  const user = await getUser(context.req.cookies[ECookieName.AUTH]);
  if (!user)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };

  const eventRegistrationDocs = await EventRegistration.find({
    user: user._id,
  }).populate("event");

  const registeredEvents = eventRegistrationDocs
    .filter((er) => er.event !== null)
    .map((er) => er.event);

  return {
    props: {
      user: stringifyAndParse(user),
      events: stringifyAndParse(registeredEvents),
    },
  };
};
