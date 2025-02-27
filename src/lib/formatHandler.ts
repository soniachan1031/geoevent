import { intervalToDuration } from "date-fns";

export const formatMinutes = (minutes: number) => {
  const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 });

  const hours = duration.hours ? `${duration.hours}h` : "";
  const mins = duration.minutes ? `${duration.minutes}m` : "";

  return [hours, mins].filter(Boolean).join(" "); // Ensures no "undefined"
};