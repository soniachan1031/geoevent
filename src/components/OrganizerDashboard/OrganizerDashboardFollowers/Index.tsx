import { useEffect, useState } from "react";
import Image from "next/image";
import { IUser, EUserRole } from "@/types/user.types";
import { EApiRequestMethod } from "@/types/api.types";
import SendEmailBtn from "@/components/buttons/SendEmailBtn";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosInstance";

const EVentOrganizerDashboardFollowers = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [followers, setFollowers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFollowers = async () => {
      try {
        const res = await axiosInstance().get(
          `/api/organizers/${user._id}/followers`
        );
        setFollowers(res.data.data.docs ?? []);
      } catch (err) {
        console.error("Failed to fetch followers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [user]);

  // Redirect if not authorized (organizer/admin)
  useEffect(() => {
    if (
      user &&
      user.role !== EUserRole.ORGANIZER &&
      user.role !== EUserRole.ADMIN
    ) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-white rounded-2xl shadow-lg w-full">
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">My Followers</h1>
        {!loading && followers.length > 0 && user && (
          <SendEmailBtn
            title="Send Email to All Followers"
            requestUrl={`/api/organizers/${user._id}/email-followers`}
            method={EApiRequestMethod.POST}
            className="h-8"
          />
        )}
      </div>
  
      {/* States */}
      {loading ? (
        <div className="grid gap-3 w-full">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : followers.length === 0 ? (
        <p className="text-gray-600">You have no followers yet.</p>
      ) : (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {follower.photo?.url ? (
                  <Image
                    src={follower.photo.url}
                    alt={follower.photo.alt ?? follower.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 font-semibold text-lg">
                    {follower.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
  
                {/* Name + Email */}
                <div className="space-y-1">
                  <p className="text-base font-medium text-gray-900">{follower.name}</p>
                  {follower.email && (
                    <p className="text-sm text-muted-foreground">{follower.email}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  
  );
};

export default EVentOrganizerDashboardFollowers;
