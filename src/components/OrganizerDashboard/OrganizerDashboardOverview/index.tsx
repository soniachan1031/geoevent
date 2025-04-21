import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { useAuthContext } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// --------- TYPES ---------
export type TOrganizerOverview = {
  eventStats: {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    totalViews: number;
    totalEventRegistrations: number;
    averageRating: number;
  };
  audience: {
    totalFollowers: number;
  };
  highlights: {
    topRegisteredEvents: Array<{
      _id: string;
      registrations: number;
      eventTitle: string;
    }>;
    topViewedEvents: Array<{
      eventId: string;
      title: string;
      views: number;
    }>;
  };
  trends: {
    registrationsOverTime: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
    }>;
  };
};

const OrganizerDashboardOverview = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<TOrganizerOverview | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOverview = async () => {
      try {
        const res = await axiosInstance().get(
          `/api/organizers/${user._id}/overview`
        );
        setOverview(res.data.data);
      } catch (err) {
        toast.error(getErrorMsg(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="grid gap-8 w-full">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!overview) return <p>No overview data available.</p>;

  const { eventStats, audience, highlights, trends } = overview;

  return (
    <div className="w-full flex flex-col gap-8 w-full p-4 md:p-6">
  {/* Event Stats */}
  <section className="bg-white rounded-2xl shadow-sm border border-border p-5">
    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Event Performance</h2>
    <div className=" grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <OverviewCard title="Total Events" value={eventStats.totalEvents} />
      <OverviewCard title="Upcoming Events" value={eventStats.upcomingEvents} />
      <OverviewCard title="Completed Events" value={eventStats.completedEvents} />
      <OverviewCard title="Total Views" value={eventStats.totalViews} />
      <OverviewCard title="Total Registrations" value={eventStats.totalEventRegistrations} />
      <OverviewCard title="Avg. Rating" value={`${eventStats.averageRating?.toFixed(2)} / 5`} />
    </div>
  </section>

  {/* Followers */}
  <section className="bg-white rounded-2xl shadow-sm border border-border p-5">
    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Audience</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <OverviewCard title="Total Followers" value={audience.totalFollowers} />
    </div>
  </section>

  {/* Highlights */}
  <section className="bg-white rounded-2xl shadow-sm border border-border p-5">
    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Highlights</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Top Registered Events">
        <div className="overflow-x-auto">
          <Bar
            data={{
              labels: highlights.topRegisteredEvents.map((e) => e.eventTitle),
              datasets: [{
                label: "Registrations",
                data: highlights.topRegisteredEvents.map((e) => e.registrations),
                backgroundColor: "#36a2eb",
              }],
            }}
            options={{ responsive: true, indexAxis: "y" }}
          />
        </div>
      </ChartCard>

      <ChartCard title="Top Viewed Events">
        <div className="overflow-x-auto">
          <Bar
            data={{
              labels: highlights.topViewedEvents.map((e) => e.title),
              datasets: [{
                label: "Views",
                data: highlights.topViewedEvents.map((e) => e.views),
                backgroundColor: "#f39c12",
              }],
            }}
            options={{ responsive: true }}
          />
        </div>
      </ChartCard>
    </div>
  </section>

  {/* Trends */}
  <section className="bg-white rounded-2xl shadow-sm border border-border p-5">
    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Trends</h2>
    <ChartCard title="Registrations Over Time">
      <div className="overflow-x-auto">
        <Bar
          data={{
            labels: trends.registrationsOverTime.map(
              (d) => `${d._id.year}-${d._id.month}-${d._id.day}`
            ),
            datasets: [{
              label: "Registrations",
              data: trends.registrationsOverTime.map((d) => d.count),
              backgroundColor: "#2ecc71",
            }],
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      </div>
    </ChartCard>
  </section>
</div>

  );
};

export default OrganizerDashboardOverview;

// --------- Styled Reusable Components ---------
const OverviewCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition">
    <h3 className="text-md font-semibold text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);
