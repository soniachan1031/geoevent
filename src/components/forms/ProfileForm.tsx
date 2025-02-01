import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthContext from "@/context/AuthContext";
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
import { format } from "date-fns";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  phone: z.string().length(10, "Phone number must be 10 digits"),
  dateOfBirth: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    { message: "Invalid date format" }
  ),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  photo: z.instanceof(File).optional(),
});

function ProfileForm() {
  const { authLoading, setAuthLoading, user, setUser } =
    useContext(AuthContext);
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
        ? format(new Date(user.dateOfBirth), "yyyy-MM-dd")
        : "",
      bio: user?.bio ?? "",
      photo: undefined as File | undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setAuthLoading(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify(values));
      if (values.photo) {
        formData.append("photo", values.photo);
      }

      const response = await axiosInstance().patch("api/auth/me", formData);
      const updatedUser = response.data.data.doc;

      setUser(updatedUser);
      setAuthLoading(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      setAuthLoading(false);
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
        className="space-y-6 bg-white p-5 shadow w-full sm:w-[400px] rounded-lg"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Name</FormLabel>
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
              <FormLabel className="text-lg">Email</FormLabel>
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
              <FormLabel className="text-lg">Phone</FormLabel>
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
              <FormLabel className="text-lg">Date of Birth</FormLabel>
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
              <FormLabel className="text-lg">Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Upload */}
        <FormField
          control={form.control}
          name="photo"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg">Profile Picture</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Profile Preview"
                  className="mt-2 h-20 w-20 object-cover rounded-full"
                  width={80}
                  height={80}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          className="text-lg w-full"
          type="submit"
          loading={authLoading}
          loaderProps={{ color: "white" }}
        >
          Update Profile
        </Button>
      </form>
    </Form>
  );
}

export default ProfileForm;
