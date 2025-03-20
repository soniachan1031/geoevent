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
  const [overview, setOverview] = useState<TAdminDashboardOverview | null>(null);

  // Fetch Overview Data
  const getOverview = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance().get("/api/overview");
      setOverview(res.data.data);
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getOverview();
  }, []);

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

  if (!overview) {
    return <p>No data available</p>;
  }

  const { userManagement, eventManagement, engagement } = overview;

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6">
      {/* =========== USER MANAGEMENT =========== */}
      <section className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">User Management</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <OverviewCard title="Total Users" value={userManagement.totalUsers} />
          <OverviewCard title="Active Users (Last 30 Days)" value={userManagement.activeUsers} />
          <OverviewCard title="New Users (This Month)" value={userManagement.newUsersThisMonth} />
        </div>
      </section>
  
      {/* =========== EVENT MANAGEMENT =========== */}
      <section className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Event Management</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <OverviewCard title="Total Events" value={eventManagement.totalEvents} />
          <OverviewCard title="Completed Events" value={eventManagement.totalCompletedEvents} />
          <OverviewCard title="Upcoming Events" value={eventManagement.upcomingEvents} />
        </div>
  
        {/* Event Charts - Make them scrollable on small screens */}
        <div className="flex flex-col gap-6 mt-6 md:grid md:grid-cols-2">
          <ChartCard title="Event Categories Breakdown">
            <div className="w-full max-w-[300px] md:max-w-none mx-auto">
              <Pie data={{
                labels: eventManagement.eventCategoriesBreakdown.map((c) => c._id),
                datasets: [{ 
                  data: eventManagement.eventCategoriesBreakdown.map((c) => c.count), 
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"] 
                }]
              }} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </div>
          </ChartCard>
  
          <ChartCard title="Most Popular Events">
            <div className="w-full overflow-x-auto">
              <Bar data={{
                labels: eventManagement.mostPopularEvents.map((e) => e.title),
                datasets: [{ 
                  label: "Registrations", 
                  data: eventManagement.mostPopularEvents.map((e) => e.registrations), 
                  backgroundColor: "#4bc0c0" 
                }]
              }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
            </div>
          </ChartCard>
        </div>
      </section>
  
      {/* =========== ENGAGEMENT & PERFORMANCE =========== */}
      <section className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Engagement & Performance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <OverviewCard title="Total Event Views" value={engagement.totalEventViews} />
          <OverviewCard title="Total Event Feedbacks" value={engagement.totalEventFeedbacks} />
          <OverviewCard title="Avg. Feedback Rating" value={`${engagement.averageFeedbackRating.toFixed(2)} / 5`} />
          <OverviewCard title="Total Shares (All Events)" value={engagement.totalShares} />
        </div>
  
        {/* Engagement Charts */}
        <div className="grid gap-6 sm:grid-cols-3 mt-6">
          <ChartCard title="Average Feedback Rating">
            <div className="w-full max-w-[250px] md:max-w-none mx-auto">
              <Doughnut data={{
                labels: ["Rating", "Remaining"],
                datasets: [{ 
                  data: [engagement.averageFeedbackRating, 5 - engagement.averageFeedbackRating], 
                  backgroundColor: ["#36A2EB", "#E2E8F0"] 
                }]
              }} options={{ responsive: true, cutout: "60%" }} />
            </div>
          </ChartCard>
  
          <ChartCard title="Most Engaged Users">
            <div className="w-full overflow-x-auto">
              <Bar data={{
                labels: engagement.mostEngagedUsers.map((u) => u.userName),
                datasets: [{ 
                  label: "Registrations", 
                  data: engagement.mostEngagedUsers.map((u) => u.totalRegistrations), 
                  backgroundColor: "#ff7675" 
                }]
              }} options={{ responsive: true, indexAxis: "y" }} />
            </div>
          </ChartCard>
  
          <ChartCard title="Most Viewed Events">
            <div className="w-full overflow-x-auto">
              <Bar data={{
                labels: engagement.mostViewedEvents.map((e) => e.title),
                datasets: [{ 
                  label: "Views", 
                  data: engagement.mostViewedEvents.map((e) => e.views), 
                  backgroundColor: "#e67e22" 
                }]
              }} options={{ responsive: true }} />
            </div>
          </ChartCard>
        </div>
      </section>
    </div>
  );
  
};

export default AdminDashboardOverview;

// ========== Styled Components ==========

// **🔹 Overview Card (For Stats)**
interface IOverviewCardProps {
  title: string;
  value: string | number;
}
function OverviewCard({ title, value }: Readonly<IOverviewCardProps>) {
  return (
    <div className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition">
      <h3 className="text-md font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

// **🔹 Chart Wrapper (For Graphs)**
interface IChartCardProps {
  title: string;
  children: React.ReactNode;
}
function ChartCard({ title, children }: Readonly<IChartCardProps>) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

