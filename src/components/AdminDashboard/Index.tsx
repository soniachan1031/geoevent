import { useState } from "react";
import AdminDashboardUsers from "./AdminDashboardUsers/Index";
import AdminDashboardEvents from "./AdminDashbaordEvents/Index";
import { Button } from "../ui/button";

enum EAdminDashboardSection {
  USERS = "USERS",
  EVENTS = "EVENTS",
}

const AdminDashboard = () => {
  const [section, setSection] = useState<EAdminDashboardSection>(
    EAdminDashboardSection.USERS
  );
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <SectionToggle section={section} setSection={setSection} />
      {renderSection(section)}
    </div>
  );
};

export default AdminDashboard;

const SectionToggle = ({ section, setSection }) => {
  return (
    <div className="flex gap-3 bg-white shadow-md p-3">
      {Object.values(EAdminDashboardSection).map((value) => (
        <Button
          key={value}
          onClick={() => setSection(value)}
          variant={section === value ? "default" : "secondary"}
        >
          {value}
        </Button>
      ))}
    </div>
  );
};

const renderSection = (section: EAdminDashboardSection) => {
  switch (section) {
    case EAdminDashboardSection.USERS:
      return <AdminDashboardUsers />;
    case EAdminDashboardSection.EVENTS:
      return <AdminDashboardEvents />;
    default:
      return <AdminDashboardUsers />;
  }
};
