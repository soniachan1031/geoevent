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
import { FaUser } from "react-icons/fa";

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
        className="space-y-6 px-2 sm:px-6"
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
            <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl shadow">
              <FaUser />
            </div>
          )}

          <div className="text-center">
            <FormLabel className="text-lg font-medium text-foreground">Profile Picture</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm mt-2 text-foreground placeholder:text-muted-foreground"
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
              <FormLabel className="text-sm font-semibold text-foreground">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  className="p-3 border border-input rounded-lg text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
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
              <FormLabel className="text-sm font-semibold text-foreground">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Your email"
                  className="p-3 border border-input rounded-lg text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
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
              <FormLabel className="text-sm font-semibold text-foreground">Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  className="p-3 border border-input rounded-lg text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-foreground">Date of Birth</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="p-3 border border-input rounded-lg text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
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
              <FormLabel className="text-sm font-semibold text-foreground">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself..."
                  className="resize-none p-3 border border-input rounded-lg text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interested Categories as Pills */}
        <FormField
          control={form.control}
          name="interestedCategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-foreground">
                Interested Categories
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {Object.values(EEventCategory).map((category) => {
                    const isChecked = (field.value || []).includes(category);
                    return (
                      <label
                        key={category}
                        className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition
                        ${isChecked
                            ? "bg-primary text-white"
                            : " text-muted-foreground border-muted-foreground/20"}
                      `}
                      >
                        <input
                          type="checkbox"
                          value={category}
                          checked={isChecked}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...(field.value || []), category]
                              : field.value?.filter((c) => c !== category);
                            field.onChange(newValue);
                          }}
                          className="hidden"
                        />
                        {category}
                      </label>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          loaderProps={{ color: "white" }}
          className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition"
        >
          Update Profile
        </Button>

      </form>
    </Form>

  );
}

export default ProfileForm;
