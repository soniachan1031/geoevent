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
import { EEventCategory } from "@/types/event.types";
import { cn } from "@/lib/utils";

const formSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    interestedCategories: z
      .array(z.nativeEnum(EEventCategory))
      .min(1, "Select at least one category"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RegisterForm() {
  const { authLoading, setAuthLoading, setUser } = useContext(AuthContext);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      interestedCategories: [] as EEventCategory[],
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
    className="space-y-6 w-full"
  >
    {/* Name */}
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-input border border-input text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Email */}
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-input border border-input text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Password */}
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-input border border-input text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Confirm Password */}
    <FormField
      control={form.control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-foreground">Confirm Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-input border border-input text-foreground placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Categories */}
    <FormField
  control={form.control}
  name="interestedCategories"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-sm font-medium text-foreground">
        Interested Categories
      </FormLabel>
      <FormControl>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(EEventCategory).map((category) => {
            const isSelected = field.value?.includes(category);
            return (
              <label
                key={category}
                className={cn(
                  "flex items-center justify-center text-sm px-4 py-2 rounded-full border cursor-pointer transition",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-input text-muted-foreground border-border hover:bg-accent/30"
                )}
              >
                <input
                  type="checkbox"
                  value={category}
                  checked={isSelected}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const newValue = isChecked
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
      loading={authLoading}
      loaderProps={{ color: "white" }}
      className="w-full py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-md transition shadow-md"
    >
      Register
    </Button>
  </form>
</Form>

  );
}

export default RegisterForm;
