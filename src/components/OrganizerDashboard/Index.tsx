import { useState } from "react";
import { Button } from "../ui/button";
import OrganizerDashboardEvents from "./OrganizerDashbaordEvents/Index";
import OrganizerDashboardFollowers from "./OrganizerDashboardFollowers/Index";
import OrganizerDashboardOverview from "./OrganizerDashboardOverview";

enum EOrganizerDashboardSection {
  OVERVIEW = "OVERVIEW",
  EVENTS = "EVENTS",
  FOLLOWERS = "FOLLOWERS",
}

const OrganizerDashboard = () => {
  const [section, setSection] = useState<EOrganizerDashboardSection>(
    EOrganizerDashboardSection.OVERVIEW
  );
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 md:min-w-[700px]">
      <h1 className="text-3xl">Organizer Dashboard</h1>
      <SectionToggle section={section} setSection={setSection} />
      {renderSection(section)}
    </div>
  );
};

export default OrganizerDashboard;

const SectionToggle = ({ section, setSection }) => {
  return (
    <div className="flex gap-3 bg-white shadow-md p-2 rounded-xl">
      {Object.values(EOrganizerDashboardSection).map((value) => (
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

const renderSection = (section: EOrganizerDashboardSection) => {
  switch (section) {
    case EOrganizerDashboardSection.OVERVIEW:
      return <OrganizerDashboardOverview />;
    case EOrganizerDashboardSection.EVENTS:
      return <OrganizerDashboardEvents />;
    case EOrganizerDashboardSection.FOLLOWERS:
      return <OrganizerDashboardFollowers />;
    default:
      return <OrganizerDashboardOverview />;
  }
};
