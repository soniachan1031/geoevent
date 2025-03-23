import { POST, GET } from "./route";
import Event from "@/mongoose/models/Event";
import EventShare from "@/mongoose/models/EventShare";
import getUser from "@/lib/server/getUser";
import { parseJson } from "@/lib/server/reqParser";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/lib/server/getUser", () => jest.fn());
jest.mock("@/lib/server/connectDB", () => jest.fn());
jest.mock("@/lib/server/reqParser", () => ({
  parseJson: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: "mock-token" }),
  }),
}));

const mockReq = {} as Request;
const createParams = (id: string) => Promise.resolve({ id });

describe("POST /api/events/:id/share", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should create a share for an event", async () => {
    const eventId = "event123";
    const user = { _id: "user123" };

    (Event.findById as jest.Mock).mockResolvedValue({ _id: eventId });
    (getUser as jest.Mock).mockResolvedValue(user);
    (parseJson as jest.Mock).mockResolvedValue({
      media: "WhatsApp",
    });
    (EventShare.create as jest.Mock).mockResolvedValue({
      _id: "share1",
      media: "WhatsApp",
    });

    const res = await POST(mockReq, { params: createParams(eventId) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Event shared successfully");
  });

  it("should allow anonymous user to share", async () => {
    (Event.findById as jest.Mock).mockResolvedValue({ _id: "event123" });
    (getUser as jest.Mock).mockResolvedValue(null);
    (parseJson as jest.Mock).mockResolvedValue({
      media: "Twitter",
    });
    (EventShare.create as jest.Mock).mockResolvedValue({
      _id: "share1",
      media: "Twitter",
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.doc.media).toBe("Twitter");
  });

  it("should return 400 if media is missing", async () => {
    (Event.findById as jest.Mock).mockResolvedValue({ _id: "event123" });
    (parseJson as jest.Mock).mockResolvedValue({});

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("media is required");
  });

  it("should return 400 if media is invalid", async () => {
    (Event.findById as jest.Mock).mockResolvedValue({ _id: "event123" });
    (parseJson as jest.Mock).mockResolvedValue({
      media: "Snapchat",
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/Invalid media type/);
  });

  it("should return 404 if event is not found", async () => {
    (Event.findById as jest.Mock).mockResolvedValue(null);
    (parseJson as jest.Mock).mockResolvedValue({
      media: "Facebook",
    });

    const res = await POST(mockReq, { params: createParams("notFound") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("Event not found");
  });
});

describe("GET /api/events/:id/share", () => {
  it("should return shares for an event", async () => {
    const shares = [
      { _id: "s1", media: "WhatsApp", user: { name: "Alice" } },
      { _id: "s2", media: "Facebook", user: { name: "Bob" } },
    ];

    (EventShare.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(shares),
    });

    const res = await GET(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Shares retrieved");
    expect(data.data.docs).toHaveLength(2);
  });
});
