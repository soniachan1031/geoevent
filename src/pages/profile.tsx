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
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12">
    <div className="flex flex-col items-center w-full max-w-2xl gap-8">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-foreground">Profile</h1>
  
      {/* Profile Card */}
      <div className="w-full bg-card text-card-foreground shadow-xl rounded-xl p-8">
        <ProfileForm
          user={user}
          onSuccess={setUser}
          requestUrl="api/auth/me"
          requestMethod={EApiRequestMethod.PATCH}
        />
      </div>
  
      {/* Delete Account Section */}
      <div className="w-full text-center">
        <DeleteProfileBtn requestUrl="api/auth/me" onSuccess={onProfileDelete} />
      </div>
    </div>
  </div>
  
  
  );
  
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
