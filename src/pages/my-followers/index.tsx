import { GetServerSideProps } from "next";
import connectDB from "@/lib/server/connectDB";
import getUser from "@/lib/server/getUser";
import stringifyAndParse from "@/lib/stringifyAndParse";
import { ECookieName, EApiRequestMethod } from "@/types/api.types";
import { EUserRole, IUser } from "@/types/user.types";
import Image from "next/image";
import SendEmailBtn from "@/components/buttons/SendEmailBtn";

interface MyFollowersProps {
  user: IUser;
  followers: IUser[];
}

export default function MyFollowers({
  user,
  followers,
}: Readonly<MyFollowersProps>) {
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-50 w-full">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">My Followers</h1>
          {followers?.length > 0 && (
            <SendEmailBtn
              title="Send Email to All Followers"
              requestUrl={`/api/organizers/${user._id}/email-followers`}
              method={EApiRequestMethod.POST}
            />
          )}
        </div>

        {followers.length === 0 ? (
          <p className="text-gray-600">You have no followers yet.</p>
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div
                key={follower._id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
              >
                {follower.photo?.url ? (
                  <Image
                    src={follower.photo.url}
                    alt={follower.photo.alt ?? follower.name}
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
                  <h3 className="text-lg font-medium">{follower.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const user = await getUser(context.req.cookies[ECookieName.AUTH]);

  // Check if user is logged in and has the right role
  if (
    !user ||
    (user.role !== EUserRole.ORGANIZER && user.role !== EUserRole.ADMIN)
  ) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const Follower = (await import("@/mongoose/models/Follower")).default;
  const followersDocs = await Follower.find({ organizer: user._id }).populate({
    path: "follower",
    select: "name photo email",
  });

  const followers = followersDocs.map((f) => f.follower);

  return {
    props: {
      user: stringifyAndParse(user),
      followers: stringifyAndParse(followers),
    },
  };
};
