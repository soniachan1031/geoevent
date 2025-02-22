import { FC, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IEventFeedback } from "@/types/event.types";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import { LoadingSkeleton } from "./skeletons/LoadingSkeleton";
import Image from "next/image";
import Stars from "./Stars";

interface EventFeedbackSectionProps {
  eventId: string;
}

const EventFeedbackSection: FC<EventFeedbackSectionProps> = ({ eventId }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<IEventFeedback[]>([]);

  // Compute the average rating (avoid NaN if no feedbacks)
  const average =
    feedbacks.length > 0
      ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length
      : 0;

  const fetchFeedbacks = async () => {
    try {
      if (expanded) {
        // If it's already expanded, collapse it
        setExpanded(false);
        return;
      }
      setExpanded(true);
      setLoading(true);

      // Fetch feedbacks from the server
      const res = await axiosInstance().get(`api/events/${eventId}/feedbacks`);
      setFeedbacks(res.data.data?.docs ?? []);
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error("Failed to fetch feedbacks");
    }
  };

  /**
   * Render the inner content based on state.
   */
  const renderContent = () => {
    // If not expanded, show nothing
    if (!expanded) {
      return null;
    }

    if (loading) {
      return <LoadingSkeleton />;
    }

    if (feedbacks.length === 0) {
      return <div>No feedbacks yet.</div>;
    }

    // Otherwise, show the feedback summary + feedback items
    return (
      <div>
        {/* Summary Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Average Rating:</span>
            <span>
              <span className="font-semibold">{average.toFixed(1)}</span>
              <span> / 5</span>
              <span className="ml-1 text-sm text-gray-500">
                ({feedbacks.length} feedback
                {feedbacks.length === 1 ? "" : "s"})
              </span>
            </span>
            {/* Star Icons for the average */}
            <Stars rating={average} />
          </div>
        </div>

        {/* List of Feedbacks */}
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="border p-3 rounded">
              {fb.user && typeof fb.user === "object" && (
                <div className="flex items-center gap-2 mb-1">
                  {/* If you have user photo */}
                  {fb.user?.photo?.url && (
                    <Image
                      src={fb.user.photo.url}
                      alt={fb.user.photo.alt || fb.user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{fb.user?.name}</span>
                </div>
              )}
              {/* Stars for this feedback's rating */}
              <div className="flex items-center gap-1 mb-1">
                <Stars rating={fb.rating} />
                <span className="text-sm text-gray-500">
                  {fb.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {/* Format date nicely */}
                {new Date(fb.date).toLocaleString()}
              </p>
              <p className="mt-2 text-sm">{fb.review}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-gray-50 rounded-lg shadow p-4"
    >
      <AccordionItem value="item-1" className="no-underline">
        <AccordionTrigger onClick={fetchFeedbacks}>Feedbacks</AccordionTrigger>
        <AccordionContent>{renderContent()}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EventFeedbackSection;
