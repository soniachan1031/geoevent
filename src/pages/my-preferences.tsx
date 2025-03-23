import EmailSubscriptionButton from "@/components/buttons/EmailSubscriptionButton";
import { useAuthContext } from "@/context/AuthContext";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export default function Preferences() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 bg-gray-50">
      {/* Page Heading */}
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Preferences</h1>
        <p className="text-gray-600 mt-2">
          Manage your preferences for a more personalized experience.
        </p>
      </div>

      {/* Preferences Card */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Email Subscription
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          {user?.subscribeToEmails ? (
            <>
              You are <span className="font-medium text-green-600">subscribed</span> to emails. Stay updated with the latest news and event
              notifications.
            </>
          ) : (
            <>
              You are <span className="font-medium text-red-600">not subscribed</span> to emails. However, you will still receive essential
              communications, such as password resets and account notifications.
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
