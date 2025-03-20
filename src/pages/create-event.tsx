import EventForm from "@/components/forms/events/EventForm";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EApiRequestMethod } from "@/types/api.types";
import { EAuthStatus } from "@/types/user.types";

export default function CreateEvent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <h1 className="text-3xl font-semibold">Create Event</h1>
      <EventForm
        requestUrl="api/events"
        requestMethod={EApiRequestMethod.POST}
      />
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
