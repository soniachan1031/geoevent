import BecomeOrganizerForm from "@/components/forms/BecomeOrganizerForm";
import EventForm from "@/components/forms/events/EventForm";
import { useAuthContext } from "@/context/AuthContext";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EApiRequestMethod } from "@/types/api.types";
import { EAuthStatus, IUser } from "@/types/user.types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEvent() {
  const router = useRouter();

  const { user, setUser } = useAuthContext();

  const [isOrganizer, setIsOrganizer] = useState(
    user?.role === "organizer" || user?.role === "admin"
  );

  if (!user) return router.push("/login");

  const onSuccess = () => {
    router.push("/my-hosted-events");
  };

  const handleBecomeOrganizerSuccess = (user: IUser) => {
    setIsOrganizer(true);
    setUser(user);
  };

  if (!isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5">
        
        <BecomeOrganizerForm
          user={user}
          onSuccess={handleBecomeOrganizerSuccess}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-10">
  <div className="max-w-2xl w-full space-y-8 bg-white p-6 md:p-10 rounded-xl shadow-sm border border-primary/10">
    <div className="text-center space-y-1">
      <h1 className="text-3xl font-semibold">Create an Event</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Fill in the event details below to publish and attract attendees.
      </p>
    </div>

    <EventForm
      requestUrl="api/events"
      requestMethod={EApiRequestMethod.POST}
      onSuccess={onSuccess}
    />
  </div>
</div>

  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
