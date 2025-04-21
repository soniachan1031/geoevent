import CustomPagination from "@/components/paginations/CustomPagination";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { EApiRequestMethod, TPagination } from "@/types/api.types";
import { IUser } from "@/types/user.types";
import { MdEdit, MdDelete, MdEmail } from "react-icons/md";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { GrPowerReset } from "react-icons/gr";
import DeleteProfileBtn from "@/components/buttons/DeleteProfileBtn";
import UpdateProfileBtn from "@/components/buttons/UpdateProfileBtn";
import SendEmailBtn from "@/components/buttons/SendEmailBtn";
import { Mail, Pencil, Trash2 } from "lucide-react";

type TGetUsersProps = {
  page?: number;
  limit?: number;
  search?: string;
};

const AdminDashboardUsers = () => {
  const usersPerPage = 50;
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState<TPagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const getUsers = async ({
    page = 1,
    limit = usersPerPage,
    search = "",
  }: TGetUsersProps) => {
    try {
      setLoading(true);
      // Fetch users data
      const res = await axiosInstance().get("api/users", {
        params: { page, limit, search },
      });
      const { docs, pagination } = res.data.data;
      setUsers(docs);
      setPagination(pagination);
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers({});
  }, []);

  return (
    <div className="grid gap-5 w-full md:min-w-[700px]">
      {loading ? (
        <div className="grid gap-3 w-full">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-8 lg:px-16 mx-auto">

          <div className="w-full max-w-screen-lg mx-auto mb-4">
            <Searchbar
              searchText={searchText}
              setSearchText={setSearchText}
              getUsers={getUsers}
            />
          </div>

          {/* 📱 MOBILE VERSION (Card Layout) */}
          <div className="sm:hidden flex flex-col w-full gap-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                {/* Avatar */}
                <div className="w-14 h-14 flex-shrink-0">
                  {user.photo?.url ? (
                    <Image
                      src={user.photo.url}
                      alt={user.name}
                      width={56}
                      height={56}
                      className="rounded-full border border-gray-300 object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-14 w-14 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between gap-2">
                  {/* Name + Email + DOB */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {user.email}
                    </p>

                  </div>

                  {/* Actions (Lucide) */}
                  <div className="flex items-center gap-3 text-muted-foreground text-[18px]">
                    <SendEmailBtn
                      email={user.email}
                      title={`Send Email to ${user.name}`}
                      method={EApiRequestMethod.POST}
                      requestUrl="/api/send-email"
                      variant="ghost"
                      className="p-0 h-8 w-8 rounded-md hover:bg-muted transition"
                    >
                      <Mail className="h-4 w-4" />
                    </SendEmailBtn>

                    <UpdateProfileBtn
                      user={user}
                      variant="ghost"
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                      className="p-0 h-8 w-8 rounded-md hover:bg-muted transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </UpdateProfileBtn>

                    <DeleteProfileBtn
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                      variant="ghost"
                      className="p-0 h-8 w-8 rounded-md hover:bg-muted transition"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </DeleteProfileBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>



          {/* 🖥 DESKTOP TABLE */}
          <div className="hidden sm:block w-full mx-auto mt-6 bg-white shadow-lg rounded-xl overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[10%_20%_20%_20%_20%_10%] min-w-[700px] px-6 py-3 bg-gray-50 border-b text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              <div>Photo</div>
              <div>ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>DOB</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-[10%_20%_20%_20%_20%_10%] min-w-[700px] items-center px-6 py-4 hover:bg-gray-50 transition"
                >
                  {/* Profile Photo */}
                  <div className="flex justify-start">
                    {user.photo?.url ? (
                      <Image
                        src={user.photo.url}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                        {user.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>

                  {/* Truncated ID */}
                  <div className="text-gray-600 text-sm truncate max-w-[120px]">
                    {user._id.slice(0, 10)}...
                  </div>

                  {/* Name */}
                  <div className="text-gray-900 font-medium">{user.name}</div>

                  {/* Email */}
                  <div className="text-gray-700 text-sm truncate max-w-[240px]">
                    {user.email}
                  </div>

                  {/* DOB */}
                  <div className="text-gray-500 text-sm">
                    {user.dateOfBirth
                      ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
                      : "—"}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Send Email */}
                    <SendEmailBtn
                      email={user.email}
                      title={`Send Email to ${user.name}`}
                      method={EApiRequestMethod.POST}
                      requestUrl="/api/send-email"
                      variant="ghost"
                      className="p-0 h-8 w-8 rounded-md hover:bg-accent transition"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </SendEmailBtn>

                    {/* Update Profile */}
                    <UpdateProfileBtn
                      user={user}
                      variant="ghost"
                      className="p-0 h-8 w-8 rounded-md hover:bg-accent transition"
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </UpdateProfileBtn>

                    {/* Delete Profile */}
                    <DeleteProfileBtn
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                      variant="ghost"
                      className="p-0 h-8 w-8 rounded-md hover:bg-accent transition"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </DeleteProfileBtn>
                  </div>


                </div>
              ))}
            </div>
          </div>

          <CustomPagination
            paginationProps={pagination}
            onPageChange={(page) => getUsers({ page })}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboardUsers;

const Searchbar: FC<{
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  getUsers: (props: TGetUsersProps) => Promise<void>;
}> = ({ searchText, setSearchText, getUsers }) => {
  const reset = () => {
    setSearchText("");
    getUsers({});
  };

  return (
    <div className="flex flex-col w-full max-w-screen-xl px-4 sm:px-8 lg:px-16 mx-auto">

      {/* Actions Row: Send Email + Searchbar */}
      <div className="w-full max-w-screen-lg mx-auto mb-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">

        {/* Send Email Button */}
        <SendEmailBtn
          title="Send Email to All Users"
          requestUrl="api/send-email"
          method={EApiRequestMethod.POST}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:shadow-md transition"
        />

        {/* Search Bar */}
        <div className="relative w-full flex items-center border border-primary/40 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary">
          {/* Search Input */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search Id or Event title..."
            className="w-full py-2 pl-4 pr-20 text-sm bg-transparent outline-none rounded-lg text-gray-700 placeholder:text-muted-foreground"
          />

          {/* Divider Line */}
          <div className="absolute right-12 top-2 bottom-2 w-px bg-border" />

          {/* Icon Buttons */}
          <div className="absolute right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="p-1 hover:bg-muted"
              onClick={() => getUsers({ search: searchText })}
              type="button"
            >
              <CiSearch className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="p-1 hover:bg-muted"
              onClick={reset}
              type="button"
            >
              <GrPowerReset className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* The rest of your admin table goes here... */}
    </div>

  );
};
