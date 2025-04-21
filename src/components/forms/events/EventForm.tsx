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
import { FC, useRef, useState } from "react";
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
import { eventTimeRegex } from "@/lib/regex";
import { EApiRequestMethod } from "@/types/api.types";
import AIEventDescriptionHelperBtn from "@/components/buttons/AIEventDescriptionHelperBtn";

type TEventFormProps = {
  event?: IEvent | null;
  onSuccess?: (event: IEvent) => Promise<void> | void;
  requestUrl: string;
  requestMethod: EApiRequestMethod;
};

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
    registrationDeadline: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().optional()
    ),

    duration: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(10).optional()
    ),
    category: z.nativeEnum(EEventCategory, { message: "Invalid category" }),
    format: z.nativeEnum(EEventFormat, { message: "Invalid format" }),
    language: z
      .nativeEnum(EEventLanguage, { message: "Invalid language" })
      .optional(),
    capacity: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(1).optional()
    ),
    image: z.instanceof(File).optional(),
    contact: z.object({
      email: z.string().email("Invalid email format"),
      phone: z.string().length(10, "Phone number must be 10 digits"),
    }),
  })
  .refine(
    (data) => {
      const val = data.registrationDeadline;
      if (!val || val.trim() === "") return true; // Skip validation if empty

      const deadlineDate = new Date(val);
      const eventDate = new Date(data.date);
      return deadlineDate <= eventDate;
    },
    {
      message: "Registration deadline must be on or before the event date",
      path: ["registrationDeadline"],
    }
  );

const EventForm: FC<TEventFormProps> = ({
  event,
  onSuccess,
  requestUrl,
  requestMethod,
}) => {
  const [loading, setLoading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(
    event?.image ?? null
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

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
      language: event?.language ?? undefined,
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
    values.language ??= EEventLanguage.ENGLISH;
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify(values));
      if (values.image) {
        formData.append("image", values.image);
      }

      const response = await axiosInstance()[requestMethod](
        requestUrl,
        formData
      );

      toast.success(
        event ? "Event updated successfully" : "Event created successfully"
      );

      // Call onSuccess callback
      if (onSuccess) {
        await onSuccess(response.data.data.doc);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        {/* =================== EVENT BASICS =================== */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Basic Information
          </h2>

          {/* Image Upload */}
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
                    onChange={handleFileChange}
                  />
                </FormControl>
                {previewImage && (
                  <Image
                    src={previewImage}
                    alt="Event image preview"
                    className="mt-2 rounded-lg shadow-sm max-w-xs object-cover"
                    width={200}
                    height={200}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Event Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <span>
                    Description <span className="text-red-500">*</span>
                  </span>
                  <AIEventDescriptionHelperBtn
                    eventTitle={form.getValues("title")}
                    onSuggestionApproval={(text) =>
                      form.setValue("description", text)
                    }
                  />
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter event description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* =================== LOCATION =================== */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Location</h2>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Event Location <span className="text-red-500">*</span>
                </FormLabel>
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
        </div>

        {/* =================== DATE & TYPE =================== */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Event Schedule & Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Event Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Event Time <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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

            {/* Format */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Format <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a format" />
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
          </div>
        </div>

        {/* =================== CONTACT =================== */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="contact.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Phone <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* =================== ADVANCED OPTIONS =================== */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm text-primary hover:underline transition"
          >
            {showAdvanced
              ? "Hide Advanced Options ▲"
              : "Show Advanced Options ▼"}
          </button>

          {showAdvanced && (
            <div className="mt-6 space-y-6">
              {/* Registration Deadline */}
              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Registration Deadline{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Capacity{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter capacity"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duration (minutes){" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter event duration"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Language{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EEventLanguage).map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* =================== SUBMIT =================== */}
        <div className="pt-4">
          <Button
            className="w-full text-lg"
            type="submit"
            loading={loading}
            loaderProps={{ color: "white" }}
          >
            {event ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
