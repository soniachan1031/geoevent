import CustomPagination from "@/components/paginations/CustomPagination";
import { LoadingSkeleton } from "@/components/skeletons/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import { TPagination } from "@/types/api.types";
import { IUser } from "@/types/user.types";
import { MdEdit, MdDelete } from "react-icons/md";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { GrPowerReset } from "react-icons/gr";
import DeleteProfileBtn from "@/components/buttons/DeleteProfileBtn";
import UpdateProfileBtn from "@/components/buttons/UpdateProfileBtn";

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
    <div className="grid gap-5 w-full md:min-w-[700px] place-content-center">
      {loading ? (
        <div className="grid gap-3 w-full md:min-w-[700px]">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="grid gap-5 w-full">
          <Searchbar
            searchText={searchText}
            setSearchText={setSearchText}
            getUsers={getUsers}
          />
          <div className="w-full overflow-auto">
            <table className="bg-white rounded shadow-md">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Photo</th>
                  <th className="p-2">Id</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th>Date of birth</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="p-2">
                      {user.photo?.url ? (
                        <Image
                          src={user.photo.url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="bg-gray-100 w-10 h-10 rounded-full"></div>
                      )}
                    </td>
                    <td className="p-2">{user._id}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {(user.dateOfBirth as string)?.slice(0, 10)}
                    </td>
                    <td className="flex gap-2 p-2">
                      <UpdateProfileBtn
                        user={user}
                        variant="secondary"
                        className="p-2"
                        requestUrl={`api/users/${user._id}`}
                        onSuccess={() => getUsers({})}
                      >
                        <MdEdit />
                      </UpdateProfileBtn>
                      <DeleteProfileBtn
                        variant="secondary"
                        className="p-2 text-red-500"
                        requestUrl={`api/users/${user._id}`}
                        onSuccess={() => getUsers({})}
                      >
                        <MdDelete />
                      </DeleteProfileBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <div className="flex max-w-max overflow-hidden rounded shadow-md focus-within:shadow-lg transition">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search Id or Name..."
          className="py-1 px-3 rounded-l"
        />
        <Button
          className="rounded-l-none h-full"
          onClick={() => getUsers({ search: searchText })}
        >
          <CiSearch />
        </Button>
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="rounded-full h-8 w-8"
      >
        <GrPowerReset />
      </Button>
    </div>
  );
};
