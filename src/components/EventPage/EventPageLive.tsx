import { IEvent } from "@/types/event.types";
import { Button } from "../ui/button";

const EventPageLive: React.FC<{ event: IEvent }> = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Live Event Feed</h2>

      <div className="flex flex-col gap-4 max-w-max">
        <Button variant="destructive" className="animate-pulse">
          Go Live
        </Button>
      </div>
      <div className="grid gap-4 md:min-w-[600px]">
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white text-xl font-semibold shadow-md p-5"
          >
            Demo Live Video {id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPageLive;
