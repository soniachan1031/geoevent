import LandingPage from "@/components/LandingPage/Index";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

export const metadata = {
  title: "GeoEvents - Discover Live Events",
  description: "Discover live events happening around you with GeoEvents.",
};

const Landing = () => {
  return <LandingPage />;
};

export default Landing;

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});
