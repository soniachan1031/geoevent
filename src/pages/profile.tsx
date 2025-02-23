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
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-5">
      <h1 className="text-3xl">Profile</h1>
      <div className="md:min-w-[500px]">
        <ProfileForm
          user={user}
          onSuccess={setUser}
          requestUrl="api/auth/me"
          requestMethod={EApiRequestMethod.PATCH}
        />
      </div>
      <DeleteProfileBtn requestUrl="api/auth/me" onSuccess={onProfileDelete} />
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
