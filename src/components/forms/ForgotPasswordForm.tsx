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

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);

  // Define form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Define submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      // Send forgot password request
      await axiosInstance().post("api/auth/forgot-password", values);

      toast.success("Password reset link sent to your email");
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
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
          Send Reset Link
        </Button>
      </form>
    </Form>
  );
}
