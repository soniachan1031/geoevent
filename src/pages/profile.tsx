import DeleteProfileBtn from "@/components/buttons/DeleteProfileBtn";
import ProfileForm from "@/components/forms/ProfileForm";
import { useAuthContext } from "@/context/AuthContext";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EApiRequestMethod } from "@/types/api.types";
import { EAuthStatus } from "@/types/user.types";
import { useRouter } from "next/router";

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const router = useRouter();

  const onProfileDelete = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 w-full">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Profile</h1>
  
      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        {/* Profile Form */}
        <ProfileForm
          user={user}
          onSuccess={setUser}
          requestUrl="api/auth/me"
          requestMethod={EApiRequestMethod.PATCH}
        />
      </div>
  
      {/* Delete Account Section */}
      <div className="mt-6">
        <DeleteProfileBtn requestUrl="api/auth/me" onSuccess={onProfileDelete} />
      </div>
    </div>
  );
  
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
