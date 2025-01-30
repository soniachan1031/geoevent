import { Button } from "@/components/ui/button";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export const metadata = {
  title: "GeoEvent",
  description: "GeoEvent - Coming soon!",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screengap-5">
      <h1 className="text-3xl font-semibold">GeoEvent</h1>
      <Button>Coming soon!</Button>
    </div>
  );
}

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});
