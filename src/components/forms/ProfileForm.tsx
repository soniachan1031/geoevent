import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { IUser } from "@/types/user.types";
import { EApiRequestMethod } from "@/types/api.types";
import { EEventCategory } from "@/types/event.types";

type TProfileFormProps = {
  user?: IUser | null;
  onSuccess?: (user: IUser) => Promise<void> | void;
  requestUrl: string;
  requestMethod: EApiRequestMethod;
};

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  phone: z.string().refine(
    (val) => {
      // If user did not type anything ("" or undefined), allow it.
      // If user did type something, it must be exactly 10 characters.
      return !val || val.length === 10;
    },
    { message: "Phone number must be 10 digits" }
  ),
  dateOfBirth: z.string().refine(
    (date) => {
      // If empty or undefined, allow it:
      if (!date) return true;

      // Check if the date is valid:
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    { message: "Invalid date format" }
  ),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  photo: z.instanceof(File).optional(),
  interestedCategories: z
    .array(z.nativeEnum(EEventCategory))
    .min(1, "Select at least one category"),
});

function ProfileForm({
  user,
  onSuccess,
  requestUrl,
  requestMethod,
}: Readonly<TProfileFormProps>) {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.photo?.url ?? null
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone?.toString() ?? "",
      dateOfBirth: user?.dateOfBirth
        ? (user.dateOfBirth as string).slice(0, 10) // Get only the date part
        : "",
      bio: user?.bio ?? "",
      photo: undefined as File | undefined,
      interestedCategories: user?.interestedCategories ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify(values));
      if (values.photo) {
        formData.append("photo", values.photo);
      }

      const response = await axiosInstance()[requestMethod](
        requestUrl,
        formData
      );
      const updatedUser = response.data.data.doc;

      setLoading(false);
      if (onSuccess) {
        await onSuccess(updatedUser);
      }
      toast.success("Profile updated successfully");
    } catch (error) {
      setLoading(false);
      toast.error(getErrorMsg(error));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("photo", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded-xl w-full max-w-xl"
      >
        {/* Profile Picture Preview */}
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

          <div className="text-center">
            <FormLabel className="text-lg font-medium">
              Profile Picture
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm mt-2"
              />
            </FormControl>
          </div>
        </div>

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth Field */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">
                Date of Birth
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio Field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interested Categories Field */}
        <FormField
          control={form.control}
          name="interestedCategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800">
                Interested Categories
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {Object.values(EEventCategory).map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={category}
                        checked={(field.value as any)?.includes(category)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newValue = isChecked
                            ? [...(field.value || []), category]
                            : field.value?.filter((c) => c !== category);
                          field.onChange(newValue);
                        }}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Update Profile Button */}
        <Button
          className="text-lg w-full bg-black text-white hover:opacity-90 rounded-lg transition"
          type="submit"
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          Update Profile
        </Button>
      </form>
    </Form>
  );
}

export default ProfileForm;
