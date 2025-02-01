import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useState } from "react";
import { useRouter } from "next/router";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm({
  token,
}: Readonly<{ token: string }>) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Define form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Define submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      // Send password reset request
      await axiosInstance().post("api/auth/reset-password", {
        password: values.password,
        passwordResetToken: token,
      });

      toast.success("Password reset successful. You can now log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-5 shadow w-full sm:w-[300px]"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="text-lg w-full"
          type="submit"
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
