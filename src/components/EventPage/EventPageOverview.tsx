import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Bookmark,
  BookmarkCheck,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import SocialShareBtn from "@/components/buttons/SocialShareBtn";
import EventFeedbackSection from "@/components/EventFeedbackSection";
import FeedbackBtn from "@/components/buttons/FeedbackBtn";
import GoogleMapDirectionBtn from "@/components/buttons/GoogleMapDirectionsBtn";
import Link from "next/link";
import EventOrganizerDropdown from "@/components/EventOrganizerDropdown";
import { TICKETMASTER_EMAIL_lINK, TICKETMASTER_PHONE } from "@/lib/credentials";
import { EventPageProps } from "./Index";
import { BsHeartFill } from "react-icons/bs";

export default function EventPageOverview({
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(!!user);

  const isAdmin = user?.role === "admin";

  const eventOrganizerId =
    typeof event.organizer === "object" ? event.organizer._id : event.organizer;

  const isOrganizer = user?._id === eventOrganizerId;

  const showOrganizerDropDown = (isOrganizer || isAdmin) && !event.external;

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

    if (user && !event.external && eventOrganizerId !== user._id) {
      axiosInstance()
        .get("/api/organizers/following")
        .then((res) => {
          const followedIds = res.data.data.docs.map((org: any) => org._id);
          setIsFollowing(followedIds.includes(eventOrganizerId));
          setFollowLoading(false);
        })
        .catch(() => null);
    }
  }, [event._id, eventOrganizerId, user, event.external]);

  const handleFollowToggle = async () => {
    if (!user) return router.push("/login");

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await axiosInstance().delete("/api/organizers/following", {
          data: { organizerId: eventOrganizerId },
        });
        toast.success("Unfollowed successfully");
      } else {
        await axiosInstance().post("/api/organizers/following", {
          organizerId: eventOrganizerId,
        });
        toast.success("Followed successfully");
      }

      setIsFollowing((prev) => !prev);
    } catch (error: any) {
      toast.error(getErrorMsg(error));
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-5 max-w-4xl mx-auto">
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
      <div className="mt-6 space-y-4">
        {/* Title & Organizer Dropdown */}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
          {showOrganizerDropDown && (
            <EventOrganizerDropdown
              event={event}
              onEventUpdateSuccess={setEvent}
              variant="dropdown"
            />
          )}
        </div>

        {/* Host Info */}
        {event.external ? (
          <div className="text-muted-foreground text-sm">{event.organizer as string}</div>
        ) : typeof event.organizer === "object" ? (
          <div className="flex items-center gap-4 mt-4  mb-4 ">
            {/* Profile Photo */}
            {event.organizer.photo?.url ? (
              <Image
                src={event.organizer.photo.url}
                alt={event.organizer.name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                ?
              </div>
            )}

            {/* Name */}
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Hosted by </span>
              <span className="font-semibold">{event.organizer.name}</span>
            </p>

            {/* Follow Button */}
            {eventOrganizerId !== user?._id && (
              <Button
                variant={isFollowing ? "destructive" : "default"}
                loaderProps={{ color: "white" }}
                onClick={handleFollowToggle}
                loading={followLoading}
                disabled={followLoading}
                className="ml-auto text-sm px-4 py-1"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Unknown Organizer</div>
        )}


        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border border-border rounded-xl p-5 shadow-sm">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-5 h-5" />
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

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-5 h-5" />
            <span>
              <input
                type="time"
                value={event.time}
                disabled
                className="bg-transparent outline-none"
              />
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>
              {event.location.address}, {event.location.state}, {event.location.country}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-5 h-5" />
            <span>{event.capacity} people</span>
          </div>

          {/* Registration Deadline (Full Width) */}
          <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Registration Deadline:</span>
            <span>
              {new Date(event.registrationDeadline ?? event.date).toLocaleDateString("en-US", {
                timeZone: "UTC",
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Pills - Category, Format, Language */}
          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mt-2">
            {[event.category, event.format, event.language].map((item) => (
              <span
                key={item}
                className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons: Register, Unregister, Share, Directions, Bookmark */}
      <div className="flex flex-wrap gap-5 items-center mt-6">
        {!event.external ? (
          <>
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
        ) : (
          <Link href={event.url as string} target="_blank">
            <Button tabIndex={-1}>Register</Button>
          </Link>
        )}
        {/* bookmark button */}
        {!event.external && (
          <Button
            variant="outline"
            onClick={handleBookMark}
            loading={bookMarkEventLoading}
          >
            {bookMarked ? (
              <div className="flex items-center gap-2">
                <BsHeartFill className="w-5 h-5" />
                <span>Remove from Saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Add to Saved</span>
              </div>
            )}
          </Button>
        )}
        {/* Social Share Buttons */}
        <SocialShareBtn shareUrl={shareUrl} event={event} />

        {/* Google maps direction */}
        <GoogleMapDirectionBtn event={event} />


      </div>
      
      {/* Event Description */}
      <div className="mt-8">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">Description</h2>

        <div className="bg-white border border-muted/30 rounded-xl p-5 shadow-sm text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
          <p className="text-foreground font-medium mb-2">
            {event.title}
          </p>
          <p>
            {event.description ?? (
              <span className="italic">No description provided.</span>
            )}
          </p>
        </div>
      </div>

{/* Contact Information */}
<div className="mt-8 p-5 bg-muted/20 border border-muted/30 rounded-lg">
  <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
  <div className="flex flex-col gap-3 text-sm text-foreground">
    {/* Email */}
    <div className="flex items-center gap-2">
      <Mail className="w-4 h-4 text-muted-foreground" />
      {event.external ? (
        <Link
          href={TICKETMASTER_EMAIL_lINK}
          className="underline hover:text-primary transition"
          target="_blank"
        >
          Send an Email
        </Link>
      ) : (
        <span>{event.contact.email}</span>
      )}
    </div>

    {/* Phone */}
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-muted-foreground" />
      {event.external ? (
        <Link
          href={`tel:+${TICKETMASTER_PHONE}`}
          className="hover:underline"
        >
          {TICKETMASTER_PHONE}
        </Link>
      ) : (
        <span>{event.contact.phone}</span>
      )}
    </div>
  </div>
</div>


     {/* Feedback Section */}
{!event.external && (
  <div className="mt-8">
    {allowFeedback && (
      <div className="mb-4">
        <FeedbackBtn
          eventId={event._id}
          onSuccess={() => setFeedbackLeft(true)}
        />
      </div>
    )}
    <EventFeedbackSection eventId={event._id} />
  </div>
)}

    </div>
  );
}
