import { useState } from "react";
import AdminDashboardUsers from "./AdminDashboardUsers/Index";
import AdminDashboardEvents from "./AdminDashbaordEvents/Index";
import { Button } from "../ui/button";
import AdminDashboardOverview from "./AdminDashboardOverview/Index";

enum EAdminDashboardSection {
  OVERVIEW = "OVERVIEW",
  USERS = "USERS",
  EVENTS = "EVENTS",
}

const AdminDashboard = () => {
  const [section, setSection] = useState<EAdminDashboardSection>(
    EAdminDashboardSection.OVERVIEW
  );
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 md:min-w-[700px]">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <SectionToggle section={section} setSection={setSection} />
      {renderSection(section)}
    </div>
  );
};

export default AdminDashboard;

const SectionToggle = ({ section, setSection }) => {
  return (
    <div className="flex gap-3 bg-white shadow-md p-2 rounded-xl">
      {Object.values(EAdminDashboardSection).map((value) => (
        <Button
          key={value}
          onClick={() => setSection(value)}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            section === value
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {value}
        </Button>
      ))}
    </div>
  );
};

const renderSection = (section: EAdminDashboardSection) => {
  switch (section) {
    case EAdminDashboardSection.OVERVIEW:
      return <AdminDashboardOverview />;
    case EAdminDashboardSection.USERS:
      return <AdminDashboardUsers />;
    case EAdminDashboardSection.EVENTS:
      return <AdminDashboardEvents />;
    default:
      return <AdminDashboardOverview />;
  }
};
