import Image from "next/image";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import stringifyAndParse from "@/lib/stringifyAndParse";
import Event from "@/mongoose/models/Event";
import { IEvent } from "@/types/event.types";
import { GetServerSideProps } from "next";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import { ECookieName } from "@/types/api.types";
import SavedEvent from "@/mongoose/models/SavedEvent";
import EventRegistration from "@/mongoose/models/EventRegistration";

type EventPageProps = {
  event: IEvent;
  user: any;
  saved: boolean;
  registered: boolean;
};

export default function EventPage({
  event,
  saved: savedEvent = false,
}: Readonly<EventPageProps>) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [bookMarked, setBookMarked] = useState(savedEvent);
  const [bookMarkEventLoading, setBookMarkEventLoading] = useState(false);

  const handleBookMark = async () => {
    try {
      if (!user) return router.push("/login");
      setBookMarkEventLoading(true);

      if (bookMarked) {
        await axiosInstance().delete(`api/events/${event._id}/save`);
        setBookMarked(false);
        toast.success("Unsaved successfully");
      } else {
        await axiosInstance().post(`api/events/${event._id}/save`);
        setBookMarked(true);
        toast.success("Saved successfully");
      }

      setBookMarkEventLoading(false);
    } catch (error: any) {
      setBookMarkEventLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-5 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <CustomBreadcrumb
        links={[{ text: "Home", href: "/" }]}
        currentPage={event.title}
      />

      {/* Event Image */}
      <div className="w-full h-64 relative mt-5 rounded-lg overflow-hidden shadow-lg">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full"></div>
        )}
      </div>

      {/* Event Info */}
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-500 mt-1">
          Hosted by{" "}
          {typeof event.organizer === "object"
            ? event.organizer.name
            : "Unknown Organizer"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg shadow">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>
              <input type="time" value={event.time} disabled />
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span>
              {event.location.address}, {event.location.state},{" "}
              {event.location.country}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span>{event.capacity} people</span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
              {event.category}
            </span>
          </div>

          {/* Format & Language */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
              {event.format}
            </span>
            <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
              {event.language}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons: Save & Register */}
      <div className="flex gap-5 items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBookMark}
          loading={bookMarkEventLoading}
        >
          {bookMarked ? (
            <>
              <BookmarkCheck className="w-5 h-5" />
              <span>BookMarked</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" />
              <span>BookMark</span>
            </>
          )}
        </Button>
      </div>

      {/* Event Description */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Event Description</h2>
        <p className="mt-2 text-gray-700 whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Contact Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <span>{event.contact.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-600" />
            <span>{event.contact.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  req,
}) => {
  // connect db
  await connectDB();

  const user = await getUser(req.cookies[ECookieName.AUTH]);

  // find event by id
  const event = await Event.findById(id).populate("organizer", "name");
  if (!event) {
    return { notFound: true };
  }

  // check if user already saved the event
  const savedEvent = await SavedEvent.findOne({
    user: user?._id,
    event: event._id,
  }).select("_id");

  // check if user is already registered for the event
  const registeredEvent = await EventRegistration.findOne({
    user: user?._id,
    event: event._id,
  }).select("_id");

  return {
    props: {
      user: stringifyAndParse(user),
      event: stringifyAndParse(event),
      saved: !!savedEvent,
      registered: !!registeredEvent,
    },
  };
};
