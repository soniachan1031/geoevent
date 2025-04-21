import { useState } from "react";
import Image from "next/image";
import { GetServerSideProps } from "next";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import { ECookieName } from "@/types/api.types";
import { IUser } from "@/types/user.types";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";

interface MyFollowingProps {
  user: IUser;
  following: IUser[];
}

export default function MyFollowing({
  following: initialFollowing,
}: Readonly<MyFollowingProps>) {
  const [following, setFollowing] = useState<IUser[]>(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance().get("/api/organizers/following");
      setFollowing(res.data.data.docs);
    } catch {
      toast.error("Failed to fetch followings.");
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (organizerId: string) => {
    try {
      setLoadingId(organizerId);
      await axiosInstance().delete("/api/organizers/following", {
        data: { organizerId },
      });
      toast.success("Unfollowed successfully");
      fetchFollowing();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  let content;

  if (loading) {
    content = (
      <>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </>
    );
  } else if (following.length === 0) {
    content = (
      <p className="text-center text-gray-600 mt-10">
        You&apos;re not following any organizers yet.
      </p>
    );
  } else {
    content = following.map((org) => (
      <div
        key={org._id}
        className="flex items-center justify-between gap-5 p-4 border border-primary/20 rounded-xl bg-white shadow-sm text-card-foreground hover:shadow-md transition-shadow duration-200"
      >
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
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-semibold">
              ?
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium">{org.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{org.role}</p>
          </div>
        </div>

        <Button
          loading={loadingId === org._id}
          loaderProps={{ color: "white" }}
          variant="destructive"
          onClick={() => unfollow(org._id)}
          disabled={loadingId === org._id}
          className="px-4 py-1 text-sm font-medium rounded-lg"
        >
          {loadingId === org._id ? "Unfollowing..." : "Unfollow"}
        </Button>
      </div>
    ));
  }

  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5 w-full">
      <h1 className="text-3xl font-semibold text-center">My Followings</h1>

      <div className="w-full max-w-2xl space-y-4">{content}</div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const user = await getUser(context.req.cookies[ECookieName.AUTH]);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const Follower = (await import("@/mongoose/models/Follower")).default;

  const followingDocs = await Follower.find({
    follower: user._id,
    organizer: { $ne: user._id }, // exclude self-follows
  }).populate({
    path: "organizer",
    select: "name photo role",
  });

  const following = followingDocs.map((f) => f.organizer);

  return {
    props: {
      user: stringifyAndParse(user),
      following: stringifyAndParse(following),
    },
  };
};
