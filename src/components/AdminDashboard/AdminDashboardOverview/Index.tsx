import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";

// Chart.js
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
import { Pie, Bar, Doughnut } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// ---------- Type Definitions ----------
export type TAdminDashboardOverview = {
  userManagement: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  eventManagement: {
    totalEvents: number;
    totalCompletedEvents: number;
    upcomingEvents: number;
    eventCategoriesBreakdown: Array<{
      _id: string; // e.g. "Conference", "Workshop"
      count: number; // how many events in this category
    }>;
    mostPopularEvents: Array<{
      eventId: string;
      title: string;
      registrations: number;
    }>;
  };
  engagement: {
    totalEventViews: number;
    totalEventFeedbacks: number;
    averageFeedbackRating: number;

    // new / extended
    ratingDistribution: Array<{
      _id: number; // rating (1..5)
      count: number;
    }>;
    registrationsOverTime: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
    }>;
    totalShares: number;
    shareByMedia: Array<{
      _id: string; // e.g. "Facebook"
      count: number;
    }>;
    sharesOverTime: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
    }>;
    mostEngagedUsers: Array<{
      userId: string;
      userName: string;
      totalRegistrations: number;
    }>;
    mostViewedEvents: Array<{
      eventId: string;
      title: string;
      views: number;
    }>;
  };
};

// ---------- Component ----------
const AdminDashboardOverview = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [overview, setOverview] = useState<TAdminDashboardOverview | null>(
    null
  );

  // Fetch the overview data
  const getOverview = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance().get("/api/overview");
      setOverview(res.data.data); // The route should return TAdminDashboardOverview
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getOverview();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="grid gap-8 w-full">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  // No data
  if (!overview) {
    return <p>No data available</p>;
  }

  // Deconstruct for readability
  const { userManagement, eventManagement, engagement } = overview;
  const { totalUsers, activeUsers, newUsersThisMonth } = userManagement;

  const {
    totalEvents,
    totalCompletedEvents,
    upcomingEvents,
    eventCategoriesBreakdown,
    mostPopularEvents,
  } = eventManagement;

  const {
    totalEventViews,
    totalEventFeedbacks,
    averageFeedbackRating,
    ratingDistribution,
    registrationsOverTime,
    totalShares,
    shareByMedia,
    sharesOverTime,
    mostEngagedUsers,
    mostViewedEvents,
  } = engagement;

  // ------------------------------------------------------------------
  // 1) EVENT CATEGORIES BREAKDOWN (Pie)
  // ------------------------------------------------------------------
  const categoryLabels = eventCategoriesBreakdown.map((c) => c._id);
  const categoryCounts = eventCategoriesBreakdown.map((c) => c.count);
  const categoriesPieData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Event Categories",
        data: categoryCounts,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };
  const categoriesPieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Event Categories Breakdown" },
    },
  };

  // ------------------------------------------------------------------
  // 2) MOST POPULAR EVENTS (Vertical Bar) by registrations
  // ------------------------------------------------------------------
  const popularLabels = mostPopularEvents.map((evt) => evt.title);
  const popularValues = mostPopularEvents.map((evt) => evt.registrations);

  const mostPopularData = {
    labels: popularLabels,
    datasets: [
      {
        label: "Registrations",
        data: popularValues,
        backgroundColor: "#4bc0c0",
      },
    ],
  };
  const mostPopularOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Most Popular Events" },
    },
  };

  // ------------------------------------------------------------------
  // 3) AVERAGE FEEDBACK RATING (Doughnut)
  // ------------------------------------------------------------------
  const rating = Math.min(Math.max(averageFeedbackRating, 0), 5);
  const avgRatingData = [rating, 5 - rating];
  const ratingDoughnutData = {
    labels: ["Rating", "Remaining"],
    datasets: [
      {
        label: "Average Feedback Rating",
        data: avgRatingData,
        backgroundColor: ["#36A2EB", "#E2E8F0"],
      },
    ],
  };
  const ratingDoughnutOptions = {
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: function (ctx: any) {
            if (ctx.label === "Rating") {
              return `Rating: ${ctx.parsed.toFixed(2)} / 5`;
            } else {
              return `Remaining: ${ctx.parsed.toFixed(2)}`;
            }
          },
        },
      },
    },
  };

  // ------------------------------------------------------------------
  // 4) RATING DISTRIBUTION (Horizontal Bar)
  // ------------------------------------------------------------------
  const ratingDistLabels = ratingDistribution.map((rd) => `${rd._id} Star(s)`);
  const ratingDistValues = ratingDistribution.map((rd) => rd.count);

  const ratingDistData = {
    labels: ratingDistLabels,
    datasets: [
      {
        label: "Count",
        data: ratingDistValues,
        backgroundColor: "#FFD700", // Gold
      },
    ],
  };
  const ratingDistOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Rating Distribution (All Events)" },
    },
    scales: {
      x: { beginAtZero: true, stepSize: 1 },
    },
  };

  // ------------------------------------------------------------------
  // 5) REGISTRATIONS OVER TIME (Bar)
  // ------------------------------------------------------------------
  const registrations = registrationsOverTime.map((r) => {
    const y = r._id.year;
    const m = String(r._id.month).padStart(2, "0");
    const d = String(r._id.day).padStart(2, "0");
    return {
      dateString: `${y}-${m}-${d}`,
      count: r.count,
    };
  });
  registrations.sort((a, b) => a.dateString.localeCompare(b.dateString));

  const regLabels = registrations.map((r) => r.dateString);
  const regValues = registrations.map((r) => r.count);

  const registrationsOverTimeData = {
    labels: regLabels,
    datasets: [
      {
        label: "Registrations",
        data: regValues,
        backgroundColor: "#3498db",
      },
    ],
  };
  const registrationsOverTimeOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Registrations Over Time (All Events)" },
    },
  };

  // ------------------------------------------------------------------
  // 6) TOTAL SHARES (summary) + SHARES BY MEDIA (Pie)
  // ------------------------------------------------------------------
  const shareMediaLabels = shareByMedia.map((s) => s._id);
  const shareMediaValues = shareByMedia.map((s) => s.count);

  const shareMediaPieData = {
    labels: shareMediaLabels,
    datasets: [
      {
        label: "Shares by Media",
        data: shareMediaValues,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };
  const shareMediaPieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Shares by Media (All Events)" },
    },
  };

  // ------------------------------------------------------------------
  // 7) SHARES OVER TIME (Bar)
  // ------------------------------------------------------------------
  const sharesTime = sharesOverTime.map((s) => {
    const y = s._id.year;
    const m = String(s._id.month).padStart(2, "0");
    const d = String(s._id.day).padStart(2, "0");
    return {
      dateString: `${y}-${m}-${d}`,
      count: s.count,
    };
  });
  sharesTime.sort((a, b) => a.dateString.localeCompare(b.dateString));

  const shareTimeLabels = sharesTime.map((s) => s.dateString);
  const shareTimeValues = sharesTime.map((s) => s.count);

  const sharesOverTimeData = {
    labels: shareTimeLabels,
    datasets: [
      {
        label: "Shares",
        data: shareTimeValues,
        backgroundColor: "#8e44ad",
      },
    ],
  };
  const sharesOverTimeOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Shares Over Time (All Events)" },
    },
  };

  // ------------------------------------------------------------------
  // 8) MOST ENGAGED USERS (Horizontal Bar)
  // ------------------------------------------------------------------
  const engagedUserLabels = mostEngagedUsers.map((u) => u.userName);
  const engagedUserValues = mostEngagedUsers.map((u) => u.totalRegistrations);

  const engagedUsersData = {
    labels: engagedUserLabels,
    datasets: [
      {
        label: "Registrations",
        data: engagedUserValues,
        backgroundColor: "#ff7675",
      },
    ],
  };
  const engagedUsersOptions = {
    indexAxis: "y" as const,
    responsive: true,
    scales: {
      x: { beginAtZero: true, stepSize: 1 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Most Engaged Users (All Events)" },
    },
  };

  // ------------------------------------------------------------------
  // 9) MOST VIEWED EVENTS (Vertical Bar)
  // ------------------------------------------------------------------
  const mostViewedLabels = mostViewedEvents.map((evt) => evt.title);
  const mostViewedValues = mostViewedEvents.map((evt) => evt.views);

  const mostViewedData = {
    labels: mostViewedLabels,
    datasets: [
      {
        label: "Views",
        data: mostViewedValues,
        backgroundColor: "#e67e22",
      },
    ],
  };
  const mostViewedOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Most Viewed Events (All Time)" },
    },
  };

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full p-5">
      {/* =========== USER MANAGEMENT =========== */}
      <section className="bg-gray-50 p-5 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          <OverviewCard title="Total Users" value={totalUsers} />
          <OverviewCard
            title="Active Users (Last 30 Days)"
            value={activeUsers}
          />
          <OverviewCard
            title="New Users (This Month)"
            value={newUsersThisMonth}
          />
        </div>
      </section>

      {/* =========== EVENT MANAGEMENT =========== */}
      <section className="bg-gray-50 p-5 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Event Management</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          <OverviewCard title="Total Events" value={totalEvents} />
          <OverviewCard title="Completed Events" value={totalCompletedEvents} />
          <OverviewCard title="Upcoming Events" value={upcomingEvents} />
        </div>

        <div className="flex flex-wrap gap-8 mt-6">
          {/* PIE: Event Categories */}
          <div className="bg-white p-4 shadow rounded max-w-sm">
            <Pie data={categoriesPieData} options={categoriesPieOptions} />
          </div>

          {/* BAR: Most Popular Events */}
          <div className="bg-white p-4 shadow rounded max-w-xl">
            <Bar data={mostPopularData} options={mostPopularOptions} />
          </div>
        </div>
      </section>

      {/* =========== ENGAGEMENT & PERFORMANCE =========== */}
      <section className="bg-gray-50 p-5 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Engagement & Performance</h2>
        {/* Summary Row */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 mb-8">
          <OverviewCard title="Total Event Views" value={totalEventViews} />
          <OverviewCard
            title="Total Event Feedbacks"
            value={totalEventFeedbacks}
          />
          <OverviewCard
            title="Avg. Feedback Rating"
            value={`${averageFeedbackRating.toFixed(2)} / 5`}
          />

          {/* Shares Summary */}
          <OverviewCard title="Total Shares (All Events)" value={totalShares} />
        </div>

        {/* Registrations Over Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Doughnut: Average Rating */}
          <div className="bg-white p-4 shadow rounded max-w-xs">
            <h3 className="text-xl font-semibold mb-2">
              Average Feedback Rating
            </h3>
            <Doughnut
              data={ratingDoughnutData}
              options={ratingDoughnutOptions}
            />
          </div>

          {/* Horizontal Bar: Rating Distribution */}
          <div className="bg-white p-4 shadow rounded max-w-lg">
            <Bar data={ratingDistData} options={ratingDistOptions} />
          </div>
          <div className="bg-white p-4 shadow rounded max-w-xl">
            <Bar
              data={registrationsOverTimeData}
              options={registrationsOverTimeOptions}
            />
          </div>

          {/* Horizontal Bar: Most Engaged Users */}
          <div className="bg-white p-4 shadow rounded max-w-xl">
            <Bar data={engagedUsersData} options={engagedUsersOptions} />
          </div>

          {/* Vertical Bar: Most Viewed Events */}
          <div className="bg-white p-4 shadow rounded max-w-xl">
            <Bar data={mostViewedData} options={mostViewedOptions} />
          </div>

          {/* Shares by Media (Pie) */}
          <div className="bg-white p-4 shadow rounded max-w-md">
            <Pie data={shareMediaPieData} options={shareMediaPieOptions} />
          </div>

          {/* Shares Over Time (Bar) */}
          <div className="bg-white p-4 shadow rounded max-w-xl">
            <Bar data={sharesOverTimeData} options={sharesOverTimeOptions} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardOverview;

// Simple card component for numeric data
interface IOverviewCardProps {
  title: string;
  value: string | number;
}
function OverviewCard({ title, value }: Readonly<IOverviewCardProps>) {
  return (
    <div className="bg-white p-5 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl text-accent-600 mt-6">{value}</p>
    </div>
  );
}
