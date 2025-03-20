// pages/events/[id]/analytics.tsx

import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import getUser from "@/lib/server/getUser";
import { ECookieName } from "@/types/api.types";
import { EUserRole } from "@/types/user.types";
import Event from "@/mongoose/models/Event";
import getErrorMsg from "@/lib/getErrorMsg";
import stringifyAndParse from "@/lib/stringifyAndParse";

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
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Extend the analytics interface to include share data
interface IEventAnalytics {
  totalViews: number;
  totalRegistrations: number;
  totalFeedbackCount: number;
  averageRating: number;
  ratingDistribution: {
    _id: number; // rating: 1..5
    count: number;
  }[];
  registrationsOverTime: {
    _id: { year: number; month: number; day: number };
    count: number;
  }[];

  // NEW share data
  totalShares: number;
  shareByMedia: {
    _id: string; // e.g. "Facebook", "WhatsApp", etc.
    count: number;
  }[];
  sharesOverTime: {
    _id: { year: number; month: number; day: number };
    count: number;
  }[];
}

export default function Analytics({ id }: Readonly<{ id: string }>) {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<IEventAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/events/${id}/analytics`);
        setAnalytics(res.data.data.analytics);
      } catch (error: any) {
        toast.error(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="grid gap-8 w-full md:w-[50%] lg:w-[33%]">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!analytics) {
    return <p>No analytics available</p>;
  }

  // =======================================
  // 1) Summary cards: views, registrations, feedback, shares
  // =======================================
  const {
    totalViews,
    totalRegistrations,
    totalFeedbackCount,
    totalShares,
    averageRating,
  } = analytics;

  // =======================================
  // 2) Doughnut: Average Rating
  // =======================================
  const rating = Math.min(Math.max(averageRating, 0), 5);
  const ratingData = [rating, 5 - rating];
  const doughnutData = {
    labels: ["Rating", "Remaining"],
    datasets: [
      {
        label: "Average Rating",
        data: ratingData,
        backgroundColor: ["#36A2EB", "#E2E8F0"],
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    cutout: "60%" as const,
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

  // =======================================
  // 3) Horizontal Bar: Rating Distribution
  // =======================================
  const distLabels = analytics.ratingDistribution.map(
    (r) => `${r._id} Star(s)`
  );
  const distValues = analytics.ratingDistribution.map((r) => r.count);

  const ratingDistData = {
    labels: distLabels,
    datasets: [
      {
        label: "Number of Feedbacks",
        data: distValues,
        backgroundColor: "#FFD700", // gold
      },
    ],
  };
  const ratingDistOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Rating Distribution" },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // =======================================
  // 4) Registrations Over Time
  // =======================================
  const registrations = analytics.registrationsOverTime.map((r) => {
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

  const regData = {
    labels: regLabels,
    datasets: [
      {
        label: "Registrations",
        data: regValues,
        backgroundColor: "#1abc9c",
      },
    ],
  };
  const regOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Registrations Over Time" },
    },
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
  };

  // =======================================
  // 5) Share Data
  // =======================================
  // a) Pie: Shares by Media
  const shareMediaLabels = analytics.shareByMedia.map((m) => m._id);
  const shareMediaCounts = analytics.shareByMedia.map((m) => m.count);

  const shareMediaPieData = {
    labels: shareMediaLabels,
    datasets: [
      {
        label: "Shares by Media",
        data: shareMediaCounts,
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
      title: { display: true, text: "Shares by Media" },
    },
  };

  // b) Shares Over Time
  const shares = analytics.sharesOverTime.map((s) => {
    const y = s._id.year;
    const m = String(s._id.month).padStart(2, "0");
    const d = String(s._id.day).padStart(2, "0");
    return {
      dateString: `${y}-${m}-${d}`,
      count: s.count,
    };
  });
  shares.sort((a, b) => a.dateString.localeCompare(b.dateString));

  const shareOverTimeLabels = shares.map((s) => s.dateString);
  const shareOverTimeCounts = shares.map((s) => s.count);

  const shareOverTimeData = {
    labels: shareOverTimeLabels,
    datasets: [
      {
        label: "Shares",
        data: shareOverTimeCounts,
        backgroundColor: "#8e44ad",
      },
    ],
  };
  const shareOverTimeOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "Shares Over Time" },
    },
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
  };

  // =======================================
  // RENDER
  // =======================================
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 bg-gray-50">
      <h1 className="text-2xl font-bold">Event Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full max-w-5xl">
        <SummaryCard title="Total Views" value={totalViews} />
        <SummaryCard title="Total Registrations" value={totalRegistrations} />
        <SummaryCard title="Total Feedbacks" value={totalFeedbackCount} />
        <SummaryCard title="Total Shares" value={totalShares} />
      </div>

      {/* Average Rating (Doughnut) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
        <div className="bg-white p-5 shadow-md rounded w-full max-w-md">
          <h2 className="text-xl font-semibold mb-3">Average Rating</h2>
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <p className="text-center mt-2 text-sm">
            <strong>{averageRating.toFixed(2)}</strong> / 5
          </p>
        </div>

        {/* Rating Distribution (Horizontal Bar) */}
        <div className="bg-white p-5 shadow-md rounded w-full max-w-xl">
          <Bar data={ratingDistData} options={ratingDistOptions} />
        </div>

        {/* Registrations Over Time (Bar) */}
        <div className="bg-white p-5 shadow-md rounded w-full max-w-xl">
          <Bar data={regData} options={regOptions} />
        </div>

        {/* Shares by Media (Pie) */}
        <div className="bg-white p-5 shadow-md rounded w-full max-w-md">
          <Pie data={shareMediaPieData} options={shareMediaPieOptions} />
        </div>

        {/* Shares Over Time (Bar) */}
        <div className="bg-white p-5 shadow-md rounded w-full max-w-xl">
          <Bar data={shareOverTimeData} options={shareOverTimeOptions} />
        </div>
      </div>
    </div>
  );
}

// Simple summary card
function SummaryCard({
  title,
  value,
}: Readonly<{ title: string; value: number }>) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl text-blue-600 mt-1">{value}</p>
    </div>
  );
}

// --------------------------------------
// Server-side check: user must be admin
// or the event's organizer
// --------------------------------------
export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
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

  const { id } = query;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  // Check if event exists & user is admin or event organizer
  const event = await Event.findById(id);
  if (!event) {
    return { notFound: true };
  }

  if (
    user.role !== EUserRole.ADMIN &&
    user._id.toString() !== String(event.organizer)
  ) {
    return { notFound: true };
  }

  return {
    props: {
      id,
      user: stringifyAndParse(user), // if needed on client
    },
  };
};
