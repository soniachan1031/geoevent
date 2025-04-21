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
    <div className="min-h-screen flex items-center justify-center px-4 pb-12 pt-8">
    <div className="w-full max-w-sm flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-center text-foreground">
        You must become an organizer first!
      </h1>
  
      <div className="bg-muted/10 p-6 rounded-xl w-full  shadow-lg space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Please confirm your name and profile photo. This will be used for your public organizer profile and is important for building trust and recognition with your audience.
        </p>
  
        {/* Profile Image */}
        <div className="flex justify-center">
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
        </div>
  
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Your Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Enter your full name"
            />
          </div>
  
          <div>
            <Label className="text-sm font-medium">Upload a Profile Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 text-sm"
            />
          </div>
        </div>
  
        <Button
          type="button"
          onClick={handleBecomeOrganizer}
          className="w-full text-base font-semibold"
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          Become an Organizer
        </Button>
      </div>
    </div>
  </div>
  

  );
};

export default BecomeOrganizerForm;
