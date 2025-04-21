import EmailSubscriptionButton from "@/components/buttons/EmailSubscriptionButton";
import { useAuthContext } from "@/context/AuthContext";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export default function Preferences() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 bg-background">
  {/* Page Heading */}
  <div className="w-full max-w-2xl text-center">
    <h1 className="text-3xl font-bold text-foreground">Preferences</h1>
    <p className="text-muted-foreground mt-2">
      Manage your preferences for a more personalized experience.
    </p>
  </div>

  {/* Preferences Card */}
  <div className="w-full max-w-lg bg-card text-card-foreground shadow-xl rounded-xl p-6 mt-8">
    <h2 className="text-lg font-semibold text-foreground mb-3">
      Email Subscription
    </h2>

    <p className="text-sm text-muted-foreground leading-relaxed">
      {user?.subscribeToEmails ? (
        <>
          You are{" "}
          <span className="font-medium text-green-600">subscribed</span> to
          emails. Stay updated with the latest news and event notifications.
        </>
      ) : (
        <>
          You are{" "}
          <span className="font-medium text-red-600">not subscribed</span> to
          emails. However, you will still receive essential communications, such
          as password resets and account notifications.
        </>
      )}
    </p>

    {/* Subscription Toggle Button */}
    <div className="mt-4">
      <EmailSubscriptionButton subscribed={user?.subscribeToEmails} />
    </div>
  </div>
</div>

  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
