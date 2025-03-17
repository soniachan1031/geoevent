import EventForm from "@/components/forms/events/EventForm";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EApiRequestMethod } from "@/types/api.types";
import { EAuthStatus } from "@/types/user.types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateEvent() {
  const router = useRouter();

  const onSuccess = () => {
    toast.success("Event created successfully");
    router.push("/my-hosted-events");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <h1 className="text-3xl font-semibold">Create Event</h1>
      <EventForm
        requestUrl="api/events"
        requestMethod={EApiRequestMethod.POST}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
