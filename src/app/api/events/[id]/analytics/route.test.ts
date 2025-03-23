import { GET } from "./route";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventShare from "@/mongoose/models/EventShare";
import { guard } from "@/lib/server/middleware/guard";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

const mockReq = {} as Request;
const createParams = (id: string) => Promise.resolve({ id });

describe("GET /api/events/[id]/analytics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return analytics data for organizer", async () => {
    const user = { _id: "user123", role: "user" };

    const validEventId = "507f1f77bcf86cd799439011";

    (guard as jest.Mock).mockResolvedValue(user);
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: validEventId,
      organizer: "user123",
    });

    (EventViews.aggregate as jest.Mock).mockResolvedValue([{ totalViews: 10 }]);
    (EventRegistration.countDocuments as jest.Mock).mockResolvedValue(5);
    (EventFeedback.countDocuments as jest.Mock).mockResolvedValue(3);
    (EventFeedback.aggregate as jest.Mock)
      .mockResolvedValueOnce([{ average: 4.2 }]) // avg rating
      .mockResolvedValueOnce([{ _id: 5, count: 2 }]); // rating dist
    (EventRegistration.aggregate as jest.Mock).mockResolvedValue([]);
    (EventShare.countDocuments as jest.Mock).mockResolvedValue(2);
    (EventShare.aggregate as jest.Mock)
      .mockResolvedValueOnce([{ _id: "Facebook", count: 1 }]) // shareByMedia
      .mockResolvedValueOnce([]); // sharesOverTime

    const res = await GET(mockReq, { params: createParams(validEventId) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Event analytics retrieved");
    expect(data.data.analytics.totalViews).toBe(10);
  });

  it("should return 400 if id is missing", async () => {
    const res = await GET(mockReq, { params: createParams("" as any) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid event id");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await GET(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("Event not found");
  });

  it("should return 403 if user is not organizer or admin", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user456", role: "user" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event123",
      organizer: "user123",
    });

    const res = await GET(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe("Forbidden");
  });
});
