import AdminDashboard from "@/components/AdminDashboard/Index";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EUserRole } from "@/types/user.types";

const Admin = () => {
  return <AdminDashboard />;
};

export default Admin;

export const getServerSideProps = serverSidePropsHandler({
  access: EUserRole.ADMIN,
});
