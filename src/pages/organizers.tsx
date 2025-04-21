import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthContext } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus, IUser } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";

interface Organizer extends IUser {
  isFollowing?: boolean;
}

export default function Organizers() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      const [orgRes, followingRes] = await Promise.all([
        axiosInstance().get("/api/organizers"),
        user
          ? axiosInstance().get("/api/organizers/following")
          : Promise.resolve({ data: { data: { docs: [] } } }),
      ]);

      const followingIds = followingRes.data.data.docs.map((o: IUser) => o._id);
      const combined = orgRes.data.data.docs.map((org: IUser) => ({
        ...org,
        isFollowing: followingIds.includes(org._id),
      }));

      setOrganizers(combined);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      toast.error("Failed to fetch organizers");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizers();
  }, [user, fetchOrganizers]);

  const handleFollowToggle = async (
    organizerId: string,
    isFollowing: boolean
  ) => {
    if (!user) return router.push("/login");
    try {
      setLoadingId(organizerId);
      if (isFollowing) {
        await axiosInstance().delete("/api/organizers/following", {
          data: { organizerId },
        });
        fetchOrganizers();
        toast.success("Unfollowed successfully");
      } else {
        await axiosInstance().post("/api/organizers/following", {
          organizerId,
        });
        fetchOrganizers();
        toast.success("Followed successfully");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Error updating follow status"
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 bg-background w-full">
    {/* Page Header */}
    <div className="w-full max-w-3xl text-center mb-6">
      <h1 className="text-3xl font-bold text-foreground">Organizers</h1>
    </div>
  
    {/* Organizer List */}
    <div className="w-full max-w-3xl space-y-4">
      {(() => {
        if (loading) {
          return (
            <div className="space-y-4">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          );
        }
  
        if (organizers.length === 0) {
          return (
            <p className="text-center text-muted-foreground">
              No organizers found.
            </p>
          );
        }
  
        return organizers.map((org) => {
          const showFollowBtn = !user || (user && org._id !== user._id);
          const isCurrentUser = user && org._id === user._id;
  
          return (
            <div
              key={org._id}
              className="flex items-center justify-between gap-5 p-4 bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Organizer Info */}
              <div className="flex items-center gap-4">
                {org.photo?.url ? (
                  <Image
                    src={org.photo.url}
                    alt={org.photo.alt ?? org.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                    ?
                  </div>
                )}
  
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        You
                      </span>
                    )}
                  </div>
                  {org.bio && (
                    <p className="text-sm text-muted-foreground">{org.bio}</p>
                  )}
                </div>
              </div>
  
              {/* Follow/Unfollow */}
              {showFollowBtn && (
                <Button
                  loading={loadingId === org._id}
                  loaderProps={{ color: "white" }}
                  variant={org.isFollowing ? "destructive" : "default"}
                  onClick={() => handleFollowToggle(org._id, org.isFollowing!)}
                  disabled={loadingId === org._id}
                  className="px-4 py-1 text-sm font-medium rounded-lg"
                >
                  {org.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          );
        });
      })()}
    </div>
  </div>
  
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});
