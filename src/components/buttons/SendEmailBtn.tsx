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

const SendEmailBtn: React.FC<{
  requestUrl: string;
  method: EApiRequestMethod;
  title: string;
  onSuccess?: () => Promise<void> | void;
}> = ({ requestUrl, method, title, onSuccess }) => {
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
      await axiosInstance()[method.toLowerCase()](requestUrl, form.getValues());
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
        <Button variant="default">Send Email</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(sendEmail)}
                className="space-y-8 bg-white p-5 shadow w-full"
              >
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Subject of the email" {...field} />
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
                      <FormLabel className="text-lg">Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your message" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel ref={closeBtnRef}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type="submit"
                    loading={loading}
                    loaderProps={{ color: "white" }}
                  >
                    Send Email
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendEmailBtn;
