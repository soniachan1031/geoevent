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
import { Input } from "../ui/input";

const FeedbackBtn: React.FC<{
  eventId: string;
  onSuccess?: () => Promise<void> | void;
}> = ({ eventId, onSuccess }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().min(8),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 1 as any,
      review: "",
    },
  });

  const submitFeedback = async () => {
    try {
      setLoading(true);

      // delete event
      await axiosInstance().post(
        `api/events/${eventId}/feedbacks`,
        form.getValues()
      );

      setLoading(false);

      toast.success("Feedback Submitted");

      // call onSuccess callback
      if (onSuccess) {
        await onSuccess();
      }

      // close the dialog
      closeBtnRef.current?.click();
    } catch (error: any) {
      // handle error
      setLoading(false);
      toast.error(getErrorMsg(error));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default">Leave Feedback</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Feedback</AlertDialogTitle>
          <AlertDialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitFeedback)}
                className="space-y-8 bg-white p-5 shadow w-full"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Rating</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          name={field.name}
                          placeholder="Rating (1 - 5)"
                          value={field.value}
                          onChange={(e) => {
                            const numValue = e.target.value
                              ? Number(e.target.value)
                              : "";
                            field.onChange(numValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Review</FormLabel>
                      <FormControl>
                        <Input placeholder="Your review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel ref={closeBtnRef}>Close</AlertDialogCancel>
                  <Button
                    type="submit"
                    loading={loading}
                    loaderProps={{ color: "white" }}
                  >
                    Leave Feedback
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

export default FeedbackBtn;
