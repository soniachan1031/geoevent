import OrganizerDashboard, {
  EOrganizerDashboardSection,
} from "@/components/OrganizerDashboard/Index";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EUserRole } from "@/types/user.types";
import { FC } from "react";

const Organizer: FC<{ activeSection: EOrganizerDashboardSection }> = ({
  activeSection,
}) => {
  return <OrganizerDashboard activeSection={activeSection} />;
};

export default Organizer;

export const getServerSideProps = serverSidePropsHandler({
  access: EUserRole.ORGANIZER,
  fn: async (ctx) => {
    const { query } = ctx;
    const activeSection = (query.activeSection as string)?.toUpperCase();

    // Fallback to OVERVIEW if invalid or missing
    const isValidSection = Object.values(EOrganizerDashboardSection).includes(
      activeSection as EOrganizerDashboardSection
    );

    return {
      activeSection: isValidSection
        ? activeSection
        : EOrganizerDashboardSection.OVERVIEW,
    };
  },
});
