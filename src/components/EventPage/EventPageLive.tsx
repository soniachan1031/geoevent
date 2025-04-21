import { IEvent } from "@/types/event.types";
import { Button } from "../ui/button";

const EventPageLive: React.FC<{ event: IEvent }> = () => {
  return (
    <div className="w-full h-[80vh] overflow-y-auto snap-y snap-mandatory flex flex-col items-center">
  {/* Reels-style feed */}
  <div className="flex flex-col gap-6 py-4 w-full max-w-md">
    {[1, 2, 3].map((id) => (
      <div
        key={id}
        className="relative snap-start w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg"
      >
        {/* Go Live Button only on first video */}
        {id === 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <Button
              variant="destructive"
              className="animate-pulse px-6 py-2 rounded-full"
            >
              Go Live
            </Button>
          </div>
        )}

        {/* Demo video */}
        <video
          src={`https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_${id}mb.mp4`}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Optional overlay label */}
        <div className="absolute bottom-4 left-4 text-white font-semibold text-lg z-10">
          Demo Live Video {id}
        </div>
      </div>
    ))}
  </div>
</div>

  
  );
};

export default EventPageLive;
