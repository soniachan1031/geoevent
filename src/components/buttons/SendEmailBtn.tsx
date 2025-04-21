import { useRef, useState } from "react";
import { Button } from "../ui/button";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { EApiRequestMethod } from "@/types/api.types";

type SendEmailBtnProps = {
  requestUrl: string;
  method: EApiRequestMethod;
  title: string;
  email?: string;
  onSuccess?: () => Promise<void> | void;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null;
  className?: string;
};

const SendEmailBtn: React.FC<SendEmailBtnProps> = ({
  requestUrl,
  method,
  title,
  email,
  onSuccess,
  children,
  className,
  variant = "default",
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    subject: z.string().min(3, "Subject is too short"),
    text: z.string().min(5, "Message is too short"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      text: "",
    },
  });

  const sendEmail = async () => {
    try {
      setLoading(true);
      const payload = {
        ...form.getValues(),
        ...(email ? { email } : {}),
      };

      await axiosInstance()[method.toLowerCase()](requestUrl, payload);
      toast.success("Email sent successfully");
      if (onSuccess) await onSuccess();
      closeBtnRef.current?.click();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant={variant} className={className}>
      {children ?? "Send Email"}
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent className="max-w-md w-full rounded-xl p-6">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-lg md:text-xl font-semibold">
        {title}
      </AlertDialogTitle>
    </AlertDialogHeader>

    <AlertDialogDescription className="mt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(sendEmail)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Subject
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Subject of the email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Message
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your message"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              loading={loading}
              loaderProps={{ color: "white" }}
              className="w-full sm:w-auto"
            >
              Send Email
            </Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </AlertDialogDescription>
  </AlertDialogContent>
</AlertDialog>

  );
};

export default SendEmailBtn;
