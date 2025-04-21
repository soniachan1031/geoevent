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
    <div className="flex gap-1 p-1 rounded-full border border-primary/30 bg-white w-fit">
  {Object.values(EEventPageSection).map((value) => {
    const isActive = section === value;
    const isLive = value === EEventPageSection.LIVE;

    return (
      <Button
        key={value}
        onClick={() => setSection(value)}
        className={`relative rounded-full px-8 py-2 text-sm font-semibold transition-all ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "bg-transparent text-muted-foreground hover:bg-muted/50"
        }`}
      >
        {value}

        {isLive && (
          <span className="absolute top-2.5 right-2.5 h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
          </span>
        )}
      </Button>
    );
  })}
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
