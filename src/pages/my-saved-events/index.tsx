import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import EventCard from "@/components/EventCard";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import SavedEvent from "@/mongoose/models/SavedEvent";
import { ECookieName } from "@/types/api.types";
import { IEvent } from "@/types/event.types";
import { GetServerSideProps } from "next";

export default function MyRegisteredEvents({
  events,
}: Readonly<{ events: IEvent[] }>) {
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <CustomBreadcrumb
        links={[{ text: "Home", href: "/" }]}
        currentPage="My Saved Events"
      />
      <h1 className="text-3xl">My Saved Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t saved any events yet.</p>
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

  const savedEvents = savedEventDocss.filter((se) => se.event !== null).map((se) => se.event);

  return {
    props: {
      user: stringifyAndParse(user),
      events: stringifyAndParse(savedEvents),
    },
  };
};
