import DeleteEventBtn from "@/components/buttons/DeleteEventBtn";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import EventForm from "@/components/forms/events/EventForm";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import Event from "@/mongoose/models/Event";
import { ECookieName } from "@/types/api.types";
import { IEvent } from "@/types/event.types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export default function EventEditPage({ event }: Readonly<{ event: IEvent }>) {
  const router = useRouter();

  const handleDeleteEventSuccess = () => {
    router.push("/my-hosted-events");
  };

  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <CustomBreadcrumb
        links={[
          { text: "Home", href: "/" },
          { text: "My Hosted Events", href: "/my-hosted-events" },
        ]}
        currentPage="Event Details"
      />
      <h1 className="text-3xl">Event Details</h1>
      <EventForm event={event} />
      <DeleteEventBtn
        eventId={event._id}
        onSuccess={handleDeleteEventSuccess}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  req,
}) => {
  const user = await getUser(req.cookies[ECookieName.AUTH]);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // find event by id and organizer
  const event = await Event.findOne({ _id: id, organizer: user._id });
  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: stringifyAndParse(user),
      event: stringifyAndParse(event),
    },
  };
};
