import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EUserRole } from "@/types/user.types";

const Admin = () => {
  return (
    <div className="flex flex-col items-center min-h-screen gap-5 p-5">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <Tabs defaultValue="account" className="">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          overview
        </TabsContent>
        <TabsContent value="users">users</TabsContent>
        <TabsContent value="events">Events</TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

export const getServerSideProps = serverSidePropsHandler({
  access: EUserRole.ADMIN,
});
