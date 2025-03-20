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
      className="space-y-6 bg-white p-6 rounded-lg w-full md:w-[400px]"
    >
      {/* Email Field */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-800">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your email" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
  
      {/* Password Field */}
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-800">Password</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
  
      {/* Login Button */}
      <Button
        className="text-lg w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
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
