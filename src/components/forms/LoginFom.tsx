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
import { IUser } from "@/types/user.types";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginForm() {
  const { authLoading, setAuthLoading, setUser } = useContext(AuthContext);
  const router = useRouter();

  // 1. Define form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setAuthLoading(true);

      // send login request
      const response = await axiosInstance().post("api/auth", values);

      // login user
      const user = response.data.data.doc as IUser;
      setUser(user);
      setAuthLoading(false);

      toast.success("Logged in");

      // redirect to homepage
      router.push("/");
    } catch (error: any) {
      // handle error
      setAuthLoading(false);
      toast.error(getErrorMsg(error));
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-5 shadow w-full sm:w-[300px]"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="text-lg w-full"
          type="submit"
          loading={authLoading}
          loaderProps={{ color: "white" }}
        >
          Login
        </Button>
      </form>
    </Form>
  );
}
