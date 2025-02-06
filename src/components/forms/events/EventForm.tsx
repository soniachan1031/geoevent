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
import { useRef, useState } from "react";
import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAfter, parseISO, startOfDay } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import LocationInput from "@/components/ui/LocationInput";
import { TLocation } from "@/types/location.types";
import extractDate from "@/lib/extractDate";
import { useRouter } from "next/router";
import { eventTimeRegex } from "@/lib/regex";

const formSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    location: z.object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
    date: z.string().refine(
      (val) => {
        const inputDate = startOfDay(parseISO(val)); // Convert to midnight local time
        const today = startOfDay(new Date()); // Normalize today's date to midnight local time

        return (
          isAfter(inputDate, today) || inputDate.getTime() === today.getTime()
        );
      },
      {
        message: "Event date must be today or in the future",
      }
    ),
    time: z.string().regex(eventTimeRegex, "Invalid time format, e.g. 11:00"),
    registrationDeadline: z.string().optional(),
    duration: z
      .number()
      .min(10, "Event duration must be at least 10 minutes")
      .optional(),
    category: z.nativeEnum(EEventCategory, { message: "Invalid category" }),
    format: z.nativeEnum(EEventFormat, { message: "Invalid format" }),
    language: z
      .nativeEnum(EEventLanguage, { message: "Invalid language" })
      .default(EEventLanguage.ENGLISH),
    capacity: z.number().min(1, "Capacity must be at least 1").optional(),
    image: z.instanceof(File).optional(),
    contact: z.object({
      email: z.string().email("Invalid email format"),
      phone: z.string().length(10, "Phone number must be 10 digits"),
    }),
  })
  .refine(
    (data) => {
      if (!data.registrationDeadline) return true; // If no deadline, skip validation

      const deadlineDate = new Date(data.registrationDeadline);
      const eventDate = new Date(data.date);
      return deadlineDate <= eventDate;
    },
    {
      message: "Registration deadline must be on or before the event date",
      path: ["registrationDeadline"], // Assigns the error message to the deadline field
    }
  );

export default function EventForm({ event }: Readonly<{ event?: IEvent }>) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(
    event?.image ?? null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      location: {
        address: event?.location?.address ?? "",
        city: event?.location?.city ?? "",
        state: event?.location?.state ?? "",
        country: event?.location?.country ?? "",
        lat: event?.location?.lat ?? 0,
        lng: event?.location?.lng ?? 0,
      },
      date: event?.date ? extractDate(event?.date as string) : "",
      time: event?.time ?? "",
      registrationDeadline: event?.registrationDeadline
        ? extractDate(event?.registrationDeadline as string)
        : "",
      category: event?.category ?? ("" as any),
      format: event?.format ?? ("" as any),
      language: event?.language ?? ("" as any),
      capacity: event?.capacity ?? ("" as any),
      duration: event?.duration ?? ("" as any),
      image: undefined as File | undefined,
      contact: {
        email: event?.contact?.email ?? "",
        phone: event?.contact?.phone?.toString() ?? "",
      },
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const url = event ? `api/events/${event._id}` : "api/events";
      const method = event ? "patch" : "post";

      const formData = new FormData();
      formData.append("data", JSON.stringify(values));
      if (values.image) {
        formData.append("image", values.image);
      }

      await axiosInstance()[method](url, formData);

      toast.success(
        event ? "Event updated successfully" : "Event created successfully"
      );

      if (!event) {
        form.reset();
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.push("/my-hosted-events");
      }
    } catch (error: any) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-5 shadow w-full md:w-[600px]"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  name={field.name}
                  ref={(ref) => {
                    field.ref(ref);
                    fileInputRef.current = ref;
                  }}
                  type="file"
                  accept="image/jpg, image/jpeg, image/png"
                  placeholder="Upload image"
                  onChange={handleFileChange}
                />
              </FormControl>
              {/* do not show preview image on successful event creation */}
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Event image Preview"
                  className="mt-2 md:max-w-[500px] object-cover"
                  width={200}
                  height={200}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationInput
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value as TLocation}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registrationDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EEventCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a Format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EEventFormat).map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a Language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EEventLanguage).map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  name={field.name}
                  placeholder="Enter event capacity"
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  name={field.name}
                  placeholder="Enter event duration in minutes"
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

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="contact.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          className="text-lg w-full"
          type="submit"
          loading={loading}
          loaderProps={{ color: "white" }}
        >
          {event ? "Update Event" : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
