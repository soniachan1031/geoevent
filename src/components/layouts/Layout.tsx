import { EUserRole, IUser } from "@/types/user.types";

const Layout: React.FC<{ children: React.ReactNode; user: IUser | null }> = ({
  children,
  user,
}) => {
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col ">
      {user.role === EUserRole.ADMIN ? "admin" : "user"}
      <div className="flex-1 md:grid md:place-items-center p-3">{children}</div>
    </div>
  );
};

export default Layout;
