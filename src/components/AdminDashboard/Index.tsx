import { useState } from "react";
import AdminDashboardUsers from "./AdminDashboardUsers/Index";
import AdminDashboardEvents from "./AdminDashbaordEvents/Index";
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
    <div className="flex justify-center">
      <div className="flex bg-white p-1 rounded-full shadow-sm border border-border">
        {Object.values(EAdminDashboardSection).map((value) => (
          <button
            key={value}
            onClick={() => setSection(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              section === value
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
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
