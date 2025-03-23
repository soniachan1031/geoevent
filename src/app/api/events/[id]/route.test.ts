import { GET, PATCH, DELETE } from "./route";
import Event from "@/mongoose/models/Event";
import { guard } from "@/lib/server/middleware/guard";
import getEvent from "@/lib/server/getEvent";
import { clearS3Folder } from "@/lib/server/s3UploadHandler";

jest.mock("@/mongoose/models/Event");
jest.mock("@/lib/server/middleware/guard", () => ({ guard: jest.fn() }));
jest.mock("@/lib/server/s3UploadHandler", () => ({
  uploadImage: jest.fn(),
  clearS3Folder: jest.fn(),
}));
jest.mock("@/lib/server/getEvent", () => jest.fn());
jest.mock("@/lib/server/connectDB", () => jest.fn());

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("GET /api/events/:id", () => {
  it("should return event if found", async () => {
    const mockEvent = { _id: "event123", title: "Test Event" };
    (getEvent as jest.Mock).mockResolvedValue(mockEvent);

    const res = await GET(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("event found");
    expect(data.data.doc).toEqual(mockEvent);
  });

  it("should return 404 if event not found", async () => {
    (getEvent as jest.Mock).mockResolvedValue(null);

    const res = await GET(mockReq, { params: createParams("notFound") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });
});

describe("PATCH /api/events/:id", () => {
  let mockUser: any;
  let mockEvent: any;

  beforeEach(() => {
    mockUser = { _id: "user123", role: "user" };
    mockEvent = {
      _id: "event123",
      organizer: "user123",
    };
  });

  it("should return 403 if not organizer or admin", async () => {
    const otherUser = { _id: "someone-else", role: "user" };
    (guard as jest.Mock).mockResolvedValue(otherUser);
    (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

    const req = {
      formData: jest.fn(),
    };

    const res = await PATCH(req as any, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe("forbidden");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue(mockUser);
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const req = {
      formData: jest.fn(),
    };

    const res = await PATCH(req as any, { params: createParams("notFound") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });
});

describe("DELETE /api/events/:id", () => {
  const mockEvent = {
    _id: "event123",
    organizer: "user123",
    image: true,
  };

  it("should delete event if organizer", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123", role: "user" });
    (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
    (Event.findByIdAndDelete as jest.Mock).mockResolvedValue(mockEvent);

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("event deleted successfully");
    expect(clearS3Folder).toHaveBeenCalledWith("events/event123/image");
  });

  it("should return 403 if not organizer or admin", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user456", role: "user" });
    (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe("forbidden");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123", role: "user" });
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });
});
