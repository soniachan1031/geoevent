import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
export type TAdminDashboardOverview = {
  usersCount: number;
  eventsCount: number;
  eventViewsCount: number;
  eventsCompletedCount: number;
  eventFeedbacksCount: number;
  allEventsFeedbackAverage: number;
};

const AdminDashboardOverview = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [overview, setOverview] = useState<TAdminDashboardOverview>({
    usersCount: 0,
    eventsCount: 0,
    eventViewsCount: 0,
    eventsCompletedCount: 0,
    eventFeedbacksCount: 0,
    allEventsFeedbackAverage: 0,
  });

  const getOverview = async () => {
    try {
      setLoading(true);
      // Fetch overview data
      const res = await axiosInstance().get("api/overview");
      const data = await res.data.data;
      setOverview(data);
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOverview();
  }, []);

  return (
    <div className="grid gap-5 w-full md:min-w-[700px]">
      {loading ? (
        <div className="grid gap-3 w-full">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <OverviewCard title="Total Users" value={overview.usersCount} />
          <OverviewCard title="Total Events" value={overview.eventsCount} />
          <OverviewCard
            title="Total Event Views"
            value={overview.eventViewsCount}
          />
          <OverviewCard
            title="Total Events Completed"
            value={overview.eventsCompletedCount}
          />
          <OverviewCard
            title="Total Event Feedbacks"
            value={overview.eventFeedbacksCount}
          />
          <OverviewCard
            title="All Events Feedback Average"
            value={`${overview.allEventsFeedbackAverage.toFixed(2)} / 5`}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboardOverview;

const OverviewCard = ({ title, value }) => {
  return (
    <div className="bg-white p-5 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl from-accent-foreground">{value}</p>
    </div>
  );
};
