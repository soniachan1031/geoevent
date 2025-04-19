import { useState } from "react";
import { Button } from "../ui/button";
import EventPageOverview from "./EventPageOverview";
import EventPageLive from "./EventPageLive";
import { IEvent } from "@/types/event.types";

export type EventPageProps = {
  event: IEvent;
  user: any;
  saved: boolean;
  registered: boolean;
  shareUrl: string;
};

enum EEventPageSection {
  OVERVIEW = "OVERVIEW",
  LIVE = "LIVE",
}

const EventPage: React.FC<EventPageProps> = (props) => {
  const [section, setSection] = useState<EEventPageSection>(
    EEventPageSection.OVERVIEW
  );
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 md:min-w-[700px]">
      <SectionToggle section={section} setSection={setSection} />
      {renderSection(section, props)}
    </div>
  );
};

export default EventPage;

const SectionToggle = ({ section, setSection }) => {
  return (
    <div className="flex gap-3 bg-white shadow-md p-2 rounded-full">
      {Object.values(EEventPageSection).map((value) => (
        <Button
          key={value}
          onClick={() => setSection(value)}
          className={`px-5 py-2 rounded-full font-medium transition-all ${(() => {
            const activeClass =
              section === EEventPageSection.LIVE
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-900 text-white shadow-md";
            return section === value
              ? activeClass
              : "bg-gray-100 text-gray-700 hover:bg-gray-200";
          })()}`}
        >
          {value}
        </Button>
      ))}
    </div>
  );
};

const renderSection = (section: EEventPageSection, props: EventPageProps) => {
  switch (section) {
    case EEventPageSection.OVERVIEW:
      return <EventPageOverview {...props} />;
    case EEventPageSection.LIVE:
      return <EventPageLive event={props.event} />;
    default:
      return <EventPageOverview {...props} />;
  }
};
