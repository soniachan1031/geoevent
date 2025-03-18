import { GET } from "./route"; // Import the GET handler
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventShare from "@/mongoose/models/EventShare";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    role: "ORGANIZER",
  }),
}));

describe("Event Analytics API", () => {
  it("should retrieve event analytics successfully", async () => {
    const req = { method: "GET" };
    const params = { id: "event123" };

    const mockEvent = {
      _id: "event123",
      organizer: "user123",
    };

    (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
    (EventViews.aggregate as jest.Mock).mockResolvedValue([
      { totalViews: 100 },
    ]);
    (EventRegistration.countDocuments as jest.Mock).mockResolvedValue(50);
    (EventFeedback.countDocuments as jest.Mock).mockResolvedValue(30);
    (EventFeedback.aggregate as jest.Mock).mockImplementation((pipeline) => {
      if (pipeline.find((step) => step.$group && step.$group.average)) {
        return [{ average: 4.5 }];
      } else {
        return [{ _id: 5, count: 10 }];
      }
    });
    (EventShare.countDocuments as jest.Mock).mockResolvedValue(20);
    (EventShare.aggregate as jest.Mock).mockResolvedValue([
      { _id: "Facebook", count: 5 },
      { _id: "WhatsApp", count: 10 },
    ]);

    const res = await GET(req as any, { params } as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event analytics retrieved");
    expect(res.body.data.analytics.totalViews).toBe(100);
    expect(res.body.data.analytics.totalRegistrations).toBe(50);
    expect(res.body.data.analytics.totalFeedbackCount).toBe(30);
    expect(res.body.data.analytics.averageRating).toBe(4.5);
    expect(res.body.data.analytics.totalShares).toBe(20);
  });

  it("should return error if event ID is invalid", async () => {
    const req = { method: "GET" };
    const params = { id: "" }; // Invalid ID

    const res = (await GET(req as any, { params } as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid event id");
  });

  it("should return error if event does not exist", async () => {
    const req = { method: "GET" };
    const params = { id: "event123" };

    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = (await GET(req as any, { params } as any)).json();

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });

  it("should return error if user is not the organizer or admin", async () => {
    jest.mock("@/lib/server/middleware/guard", () => ({
      guard: jest.fn().mockResolvedValue({
        _id: "otherUser",
        role: "USER",
      }),
    }));

    const req = { method: "GET" };
    const params = { id: "event123" };

    const mockEvent = {
      _id: "event123",
      organizer: "user123", // Different organizer
    };

    (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

    const res = (await GET(req as any, { params } as any)).json();

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });
});
