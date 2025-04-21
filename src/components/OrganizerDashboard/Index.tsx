import { FC, useState } from "react";
import { Button } from "../ui/button";
import OrganizerDashboardEvents from "./OrganizerDashbaordEvents/Index";
import OrganizerDashboardFollowers from "./OrganizerDashboardFollowers/Index";
import OrganizerDashboardOverview from "./OrganizerDashboardOverview";
import { useRouter } from "next/router";

export enum EOrganizerDashboardSection {
  OVERVIEW = "OVERVIEW",
  EVENTS = "EVENTS",
  FOLLOWERS = "FOLLOWERS",
}

const OrganizerDashboard: FC<{ activeSection: EOrganizerDashboardSection }> = ({
  activeSection: initialActiveSection = EOrganizerDashboardSection.OVERVIEW,
}) => {
  const [section, setSection] =
    useState<EOrganizerDashboardSection>(initialActiveSection);
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 md:min-w-[700px]">
      <h1 className="text-3xl">Organizer Dashboard</h1>
      <SectionToggle section={section} setSection={setSection} />
      {renderSection(section)}
    </div>
  );
};

export default OrganizerDashboard;

const SectionToggle = ({
  section,
  setSection,
}: {
  section: EOrganizerDashboardSection;
  setSection: (section: EOrganizerDashboardSection) => void;
}) => {
  const router = useRouter();

  const handleClick = (value: EOrganizerDashboardSection) => {
    setSection(value);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, activeSection: value },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="flex justify-center">
    <div className="flex bg-white p-1 rounded-full shadow-sm border border-border">
      {Object.values(EOrganizerDashboardSection).map((value) => (
        <Button
          key={value}
          onClick={() => handleClick(value)}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            section === value
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {value}
        </Button>
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
