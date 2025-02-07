import EmailSubscriptionButton from "@/components/buttons/EmailSubscriptionButton";
import { useAuthContext } from "@/context/AuthContext";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export default function CreateEvent() {
  const { user } = useAuthContext();
  return (
    <div className="flex flex-col items-center min-h-screen gap-5">
      <h1 className="text-3xl font-semibold">My Preferences</h1>
      <p>Here you can set your preferences.</p>
      <div className="flex flex-col items-center gap-5 bg-white p-5">
        <div className="flex flex-wrap items-center gap-5">
          <p>
            {user?.subscribeToEmails
              ? "You are subscribed to emails."
              : "You are not subscribed to emails. However, you will still receive necessary emails such as password resets and account notifications."}
          </p>
          <EmailSubscriptionButton subscribed={user?.subscribeToEmails} />
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
