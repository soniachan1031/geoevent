import { GET, POST } from "./route";
import Event from "@/mongoose/models/Event";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import { guard } from "@/lib/server/middleware/guard";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/lib/server/middleware/guard", () => ({ guard: jest.fn() }));
jest.mock("@/lib/server/reqParser", () => ({
  parseJson: jest.fn().mockResolvedValue({ rating: 5, review: "Great!" }),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("POST /api/events/:id/feedbacks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should allow registered user to leave feedback", async () => {
    const user = { _id: "user123" };
    (guard as jest.Mock).mockResolvedValue(user);
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event1",
      date: new Date("2020-01-01"),
    });
    (EventRegistration.findOne as jest.Mock).mockResolvedValue(true);
    (EventFeedback.findOne as jest.Mock).mockResolvedValue(null);
    (EventFeedback.create as jest.Mock).mockResolvedValue({
      rating: 5,
      review: "Great!",
    });

    const res = await POST(mockReq, { params: createParams("event1") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("feedback saved");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockReq, { params: createParams("event404") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });

  it("should return 400 if event is in the future", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event1",
      date: new Date("2999-01-01"),
    });

    const res = await POST(mockReq, { params: createParams("futureEvent") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Event has not ended yet, feedback not allowed.");
  });

  it("should return 400 if user not registered", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event1",
      date: new Date("2020-01-01"),
    });
    (EventRegistration.findOne as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockReq, { params: createParams("event1") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("not registered for event yet");
  });

  it("should return 400 if feedback already exists", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event1",
      date: new Date("2020-01-01"),
    });
    (EventRegistration.findOne as jest.Mock).mockResolvedValue(true);
    (EventFeedback.findOne as jest.Mock).mockResolvedValue(true);

    const res = await POST(mockReq, { params: createParams("event1") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("feedback already left");
  });
});

describe("GET /api/events/:id/feedbacks", () => {
  it("should return all feedbacks for the event", async () => {
    const mockFeedbacks = [
      { _id: "f1", user: { name: "Alice" }, review: "Nice" },
      { _id: "f2", user: { name: "Bob" }, review: "Cool" },
    ];

    (EventFeedback.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockFeedbacks),
    });

    const res = await GET(mockReq, { params: createParams("event1") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("feedbacks retrieved");
    expect(data.data.docs).toHaveLength(2);
  });
});
