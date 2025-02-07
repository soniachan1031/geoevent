import DeleteProfileBtn from "@/components/buttons/DeleteProfileBtn";
import ProfileForm from "@/components/forms/ProfileForm";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export default function Profile() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-5">
      <h1 className="text-3xl">Profile</h1>
      <ProfileForm />
      <DeleteProfileBtn />
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.AUTHENTICATED,
});
