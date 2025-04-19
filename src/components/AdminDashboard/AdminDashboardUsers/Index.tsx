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
          <div className="flex justify-between items-center mb-6">
            <SendEmailBtn
              title="Send Email to All Users"
              requestUrl="api/send-email"
              method={EApiRequestMethod.POST}
            />
          </div>
          <div className="w-full max-w-screen-lg mx-auto mb-4">
            <Searchbar
              searchText={searchText}
              setSearchText={setSearchText}
              getUsers={getUsers}
            />
          </div>

          {/* 📱 MOBILE VERSION (Card Layout) */}
          <div className="sm:hidden flex flex-col bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user._id} className="p-4 flex items-center gap-4">
                {/* Profile Photo */}
                <div className="w-12 h-12 flex-shrink-0">
                  {user.photo?.url ? (
                    <Image
                      src={user.photo.url}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-gray-300"
                    />
                  ) : (
                    <div className="bg-gray-200 w-12 h-12 rounded-full"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <p className="text-gray-600 text-sm truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Send email button */}
                  <SendEmailBtn
                    email={user.email}
                    title={`Send Email to ${user.name}`}
                    method={EApiRequestMethod.POST}
                    requestUrl="/api/send-email"
                    variant="secondary"
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-600 transition-all ease-in-out"
                  >
                    <MdEmail className="text-lg" />
                  </SendEmailBtn>

                  {/* send email btn */}
                  <UpdateProfileBtn
                    user={user}
                    variant="secondary"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-all ease-in-out"
                    requestUrl={`api/users/${user._id}`}
                    onSuccess={() => getUsers({})}
                  >
                    <MdEdit className="text-gray-600 text-lg" />
                  </UpdateProfileBtn>

                  <DeleteProfileBtn
                    variant="secondary"
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-md text-red-500 transition-all ease-in-out"
                    requestUrl={`api/users/${user._id}`}
                    onSuccess={() => getUsers({})}
                  >
                    <MdDelete className="text-lg" />
                  </DeleteProfileBtn>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥 DESKTOP TABLE */}
          <div className="hidden sm:block w-full mx-auto mt-6 bg-white shadow-lg rounded-xl overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[10%_20%_20%_20%_20%_10%] min-w-[700px] px-8 py-4 bg-gray-50 border-b text-gray-500 text-sm font-medium">
              <div className="text-left">Photo</div>
              <div className="text-left">ID</div>
              <div className="text-left">Name</div>
              <div className="text-left">Email</div>
              <div className="text-left">DOB</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-[10%_20%_20%_20%_20%_10%] min-w-[700px] items-center px-8 py-5 hover:bg-gray-50 transition-all ease-in-out"
                >
                  {/* Profile Photo */}
                  <div className="flex justify-left">
                    {user.photo?.url ? (
                      <Image
                        src={user.photo.url}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-300"
                      />
                    ) : (
                      <div className="bg-gray-200 w-12 h-12 rounded-full"></div>
                    )}
                  </div>

                  {/* Truncated ID */}
                  <div className="text-gray-700 text-sm truncate max-w-[100px]">
                    {user._id.slice(0, 10)}...
                  </div>

                  {/* Name */}
                  <div className="text-gray-900 text-base font-medium">
                    {user.name}
                  </div>

                  {/* Email */}
                  <div className="text-gray-700 text-base truncate max-w-[250px]">
                    {user.email}
                  </div>
                  {/* DOB */}
                  <div className="text-gray-700 text-sm">
                    {user.dateOfBirth
                      ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
                      : ""}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-4 justify-center">
                    {/* Send email button */}
                    <SendEmailBtn
                      email={user.email}
                      title={`Send Email to ${user.name}`}
                      method={EApiRequestMethod.POST}
                      requestUrl="/api/send-email"
                      variant="secondary"
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-600 transition-all ease-in-out"
                    >
                      <MdEmail className="text-lg" />
                    </SendEmailBtn>

                    <UpdateProfileBtn
                      user={user}
                      variant="secondary"
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-all ease-in-out"
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                    >
                      <MdEdit className="text-gray-600 text-xl" />
                    </UpdateProfileBtn>

                    <DeleteProfileBtn
                      variant="secondary"
                      className="p-3 bg-red-100 hover:bg-red-200 rounded-md text-red-500 transition-all ease-in-out"
                      requestUrl={`api/users/${user._id}`}
                      onSuccess={() => getUsers({})}
                    >
                      <MdDelete className="text-xl" />
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
    <div className="flex gap-5 items-center">
      {/* Search Input & Button */}
      <div className="flex items-center border border-gray-300 rounded-lg shadow-md focus-within:shadow-lg transition w-full max-w-screen-lg">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search Id or Name..."
          className="py-2 px-4 rounded-l bg-white outline-none text-gray-700 w-full sm:w-full"
        />
        <Button
          className="rounded-l-none bg-gray-100 hover:bg-gray-200 px-4 transition"
          onClick={() => getUsers({ search: searchText })}
        >
          <CiSearch className="text-gray-600 text-lg" />
        </Button>
      </div>

      {/* Reset Button */}
      <Button
        onClick={reset}
        variant="outline"
        className="rounded-full h-9 w-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition"
      >
        <GrPowerReset className="text-gray-600 text-lg" />
      </Button>
    </div>
  );
};
