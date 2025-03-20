import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";

export const GET = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});

export const POST = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});

export const PUT = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});

export const DELETE = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});

export const PATCH = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});

export const OPTIONS = catchAsync(async () => {
  return new AppResponse(404, "resource not found");
});
