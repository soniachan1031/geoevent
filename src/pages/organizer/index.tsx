import OrganizerDashboard from "@/components/OrganizerDashboard/Index";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EUserRole } from "@/types/user.types";

const Organizer = () => {
  return <OrganizerDashboard />;
};

export default Organizer;

export const getServerSideProps = serverSidePropsHandler({
  access: EUserRole.ORGANIZER,
});
