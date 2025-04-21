import EventCard from "@/components/EventCard";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import SavedEvent from "@/mongoose/models/SavedEvent";
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
    <div className="flex flex-col items-center min-h-screen gap-8 px-6 py-10 w-full bg-background">
    {/* Page Title */}
    <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Saved Events</h1>
  
    {/* Toggle Tabs */}
    <div className="flex justify-center my-6">
    <div className="flex bg-white p-1 rounded-full shadow-sm border border-border">
      {/* Registered */}
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

      {/* Saved */}
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
  
    {/* Event List */}
    {events.length === 0 ? (
      <p className="text-muted-foreground text-sm italic mt-10">
        You haven’t saved any events yet.
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

  const savedEventDocss = await SavedEvent.find({
    user: user._id,
  }).populate("event");

  const savedEvents = savedEventDocss
    .filter((se) => se.event !== null)
    .map((se) => se.event);

  return {
    props: {
      user: stringifyAndParse(user),
      events: stringifyAndParse(savedEvents),
    },
  };
};
