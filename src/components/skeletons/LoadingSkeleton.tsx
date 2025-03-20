import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex items-center space-x-4 w-full">
      <Skeleton className="h-14 w-16 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  );
}
