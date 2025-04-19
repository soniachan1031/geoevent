import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user.types";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TBecomeOrganizerFormProps = {
  user: IUser;
  onSuccess?: (user: IUser) => void | Promise<void>;
};

const BecomeOrganizerForm: React.FC<TBecomeOrganizerFormProps> = ({
  user,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.photo?.url ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState<string>(user?.name || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleBecomeOrganizer = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name,
        })
      );
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const res = await axiosInstance().post(
        `/api/users/${user._id}/become-organizer`,
        formData
      );

      toast.success("You are now an organizer!");
      if (onSuccess) await onSuccess(res.data.data?.doc as IUser);
    } catch (error) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl w-full max-w-xl space-y-6">
      <p className="text-sm text-gray-600 text-center max-w-md mx-auto">
        Please confirm your name and profile photo. This will be used for your
        public organizer profile and is important for building trust and
        recognition with your audience.
      </p>
      <div className="flex flex-col items-center gap-4">
        {previewImage ? (
          <Image
            src={previewImage}
            alt="Profile Preview"
            className="h-24 w-24 object-cover rounded-full shadow"
            width={96}
            height={96}
          />
        ) : (
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl">
            ?
          </div>
        )}

        <div className="text-center space-y-2 w-full">
          <div>
            <Label className="text-lg font-medium">Your Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Enter your full name"
            />
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium">
              Upload a Profile Photo
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm mt-2"
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleBecomeOrganizer}
        className="text-lg w-full bg-black text-white hover:opacity-90 rounded-lg transition"
        loading={loading}
        loaderProps={{ color: "white" }}
      >
        Become an Organizer
      </Button>
    </div>
  );
};

export default BecomeOrganizerForm;
