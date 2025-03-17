import Image from "next/image";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import stringifyAndParse from "@/lib/stringifyAndParse";
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
import { useEffect, useState } from "react";
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
import { getServerSidePropsSiteUrl } from "@/lib/server/urlGenerator";
import SocialShareBtn from "@/components/buttons/SocialShareBtn";
import EventFeedbackSection from "@/components/EventFeedbackSection";
import FeedbackBtn from "@/components/buttons/FeedbackBtn";
import GoogleMapDirectionBtn from "@/components/buttons/GoogleMapDirectionsBtn";
import Link from "next/link";
import getEvent from "@/lib/server/getEvent";
import { CiLink } from "react-icons/ci";
import EventOrganizerDropdown from "@/components/EventOrganizerDropdown";

type EventPageProps = {
  event: IEvent;
  user: any;
  saved: boolean;
  registered: boolean;
  shareUrl: string;
};

export default function EventPage({
  event: eventData,
  saved: savedEvent = false,
  shareUrl,
  registered: registeredEvent = false,
}: Readonly<EventPageProps>) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [event, setEvent] = useState(eventData);
  const [bookMarked, setBookMarked] = useState(savedEvent);
  const [bookMarkEventLoading, setBookMarkEventLoading] = useState(false);
  const [registered, setRegistered] = useState(registeredEvent);
  const [registerEventLoading, setRegisterEventLoading] = useState(false);
  const [feedbackLeft, setFeedbackLeft] = useState(false);

  const isAdmin = user?.role === "admin";

  const eventOrganizerId =
    typeof event.organizer === "object" ? event.organizer._id : event.organizer;

  const isOrganizer = user?._id === eventOrganizerId;

  const showOrganizerDropDown = isOrganizer || isAdmin;

  const allowFeedback =
    !isOrganizer &&
    registered &&
    new Date(event.date) < new Date() &&
    !feedbackLeft;

  const allowRegister =
    !isOrganizer &&
    !registered &&
    new Date(event.registrationDeadline ?? event.date) > new Date();

  const allowUnregister = registered;

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

  const handleRegister = async () => {
    try {
      if (!user) return router.push("/login");
      setRegisterEventLoading(true);

      if (registered) {
        await axiosInstance().delete(`api/events/${event._id}/register`);
        setRegistered(false);
        toast.success("Unregistered successfully");
      } else {
        await axiosInstance().post(`api/events/${event._id}/register`);
        setRegistered(true);
        toast.success("Registered successfully");
      }

      setRegisterEventLoading(false);
    } catch (error: any) {
      setRegisterEventLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  useEffect(() => {
    // add view to event
    axiosInstance()
      .post(`api/events/${event._id}/views`)
      .catch(() => null);
  }, [event._id]);

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
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {showOrganizerDropDown && (
            <EventOrganizerDropdown
              event={event}
              onEventUpdateSuccess={setEvent}
            />
          )}
        </div>
        <p className="text-gray-500 mt-1">
          {event.external ? (
            "External Event"
          ) : (
            <>
              Hosted by{" "}
              {typeof event.organizer === "object"
                ? event.organizer.name
                : "Unknown Organizer"}
            </>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg shadow">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>
              {new Date(event.date).toLocaleDateString("en-US", {
                timeZone: "UTC",
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

          {/* Registration Deadline */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Registration Deadline:</span>
            <span>
              {new Date(
                event.registrationDeadline ?? event.date
              ).toLocaleString("en-US", {
                timeZone: "UTC",
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons: Save & Register */}
      <div className="flex flex-wrap gap-5 items-center mt-6">
        {!event.external && (
          <>
            <Button
              variant="outline"
              onClick={handleBookMark}
              loading={bookMarkEventLoading}
            >
              {bookMarked ? (
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5" />
                  <span>BookMarked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  <span>BookMark</span>
                </div>
              )}
            </Button>

            {/* buttons: register, unregister */}
            {allowRegister ? (
              <Button
                loading={registerEventLoading}
                onClick={handleRegister}
                loaderProps={{ color: "white" }}
              >
                Register
              </Button>
            ) : (
              allowUnregister && (
                <Button
                  variant="destructive"
                  onClick={handleRegister}
                  loading={registerEventLoading}
                  loaderProps={{ color: "white" }}
                >
                  Unregister
                </Button>
              )
            )}
          </>
        )}

        {/* Social Share Buttons */}
        <SocialShareBtn shareUrl={shareUrl} event={event} />

        {/* Google maps direction */}
        <GoogleMapDirectionBtn event={event} />

        {/* link to exernal site if external event */}
        {event.external && event.url && (
          <Link href={event.url} target="_blank">
            <Button variant="outline" tabIndex={-1}>
              <div className="flex gap-3 items-center">
                <CiLink />
                <span>Visit Site</span>
              </div>
            </Button>
          </Link>
        )}
      </div>

      {/* Event Description */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Event Description</h2>
        <p className="mt-2 text-gray-700 whitespace-pre-line">
          {event.description ?? "No description provided"}
        </p>
      </div>

      {/* Contact Information */}
      {!event.external && (
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
      )}

      {/* feedback section */}
      {!event.external && (
        <>
          <div className="my-6">
            {allowFeedback && (
              <FeedbackBtn
                eventId={event._id}
                onSuccess={() => setFeedbackLeft(true)}
              />
            )}
          </div>
          <EventFeedbackSection eventId={event._id} />
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  req,
  resolvedUrl,
}) => {
  // connect db
  await connectDB();

  const user = await getUser(req.cookies[ECookieName.AUTH]);

  // find event by id
  const event = await getEvent(id as string);

  if (!event) {
    return {
      notFound: true,
    };
  }

  // check if user already saved the event
  const savedEvent = event.external
    ? false
    : await SavedEvent.findOne({
        user: user?._id,
        event: event._id,
      }).select("_id");

  // check if user is already registered for the event
  const registeredEvent = event.external
    ? false
    : await EventRegistration.findOne({
        user: user?._id,
        event: event._id,
      }).select("_id");

  const shareUrl = getServerSidePropsSiteUrl(req) + resolvedUrl;

  return {
    props: {
      user: stringifyAndParse(user),
      event: stringifyAndParse(event),
      saved: !!savedEvent,
      registered: !!registeredEvent,
      shareUrl,
    },
  };
};
