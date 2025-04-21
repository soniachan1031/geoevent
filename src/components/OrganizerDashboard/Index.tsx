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
    <div className="flex justify-center">
    <div className="flex bg-white p-1 rounded-full shadow-sm border border-border">
      {Object.values(EOrganizerDashboardSection).map((value) => (
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
