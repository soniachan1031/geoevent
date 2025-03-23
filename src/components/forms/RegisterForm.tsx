import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/router";
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
import { Input } from "../ui/input";

const formSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RegisterForm() {
  const { authLoading, setAuthLoading, setUser } =
    useContext(AuthContext);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setAuthLoading(true);
      const response = await axiosInstance().post("api/auth/register", values);
      const user = response.data.data.doc;
      setUser(user);
      setAuthLoading(false);
      toast.success("Registered successfully");
      router.push("/");
    } catch (error) {
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
    {/* Name Field */}
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-800">Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter your name" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
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

    {/* Confirm Password Field */}
    <FormField
      control={form.control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-800">Confirm Password</FormLabel>
          <FormControl>
            <Input 
              type="password" 
              placeholder="Confirm your password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Register Button */}
    <Button
      className="text-lg w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
      type="submit"
      loading={authLoading}
      loaderProps={{ color: "white" }}
    >
      Register
    </Button>
  </form>
</Form>

  );
}

export default RegisterForm;
