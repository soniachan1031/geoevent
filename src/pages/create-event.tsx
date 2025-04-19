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
        <h1 className="text-3xl font-semibold">
          You must become an organizer first!
        </h1>
        <BecomeOrganizerForm
          user={user}
          onSuccess={handleBecomeOrganizerSuccess}
        />
      </div>
    );
  }

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
