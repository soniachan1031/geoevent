import { GET } from "./route"; // Import the GET handler
import Event from "@/mongoose/models/Event";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventShare from "@/mongoose/models/EventShare";
import User from "@/mongoose/models/User";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({ role: "ADMIN" }),
}));

describe("Admin Dashboard Overview API", () => {
  describe("GET /api/overview", () => {
    it("should retrieve dashboard metrics successfully", async () => {
      const req = { method: "GET" };

      // Mock database calls
      (User.countDocuments as jest.Mock).mockResolvedValue(100);
      (Event.countDocuments as jest.Mock).mockResolvedValue(50);
      (EventRegistration.distinct as jest.Mock).mockResolvedValue([
        "user1",
        "user2",
      ]);
      (EventFeedback.distinct as jest.Mock).mockResolvedValue(["user1"]);
      (User.countDocuments as jest.Mock).mockResolvedValue(10);
      (Event.countDocuments as jest.Mock).mockResolvedValue(30);
      (Event.countDocuments as jest.Mock).mockResolvedValue(20);
      (Event.aggregate as jest.Mock).mockResolvedValue([
        { _id: "Tech", count: 5 },
      ]);
      (EventRegistration.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: "event123",
          registrations: 10,
          event: { _id: "event123", title: "Tech Conference" },
        },
      ]);
      (EventViews.aggregate as jest.Mock).mockResolvedValue([{ views: 200 }]);
      (EventFeedback.countDocuments as jest.Mock).mockResolvedValue(30);
      (EventFeedback.aggregate as jest.Mock).mockResolvedValue([
        { average: 4.5 },
      ]);
      (EventRegistration.aggregate as jest.Mock).mockResolvedValue([
        { _id: { year: 2024, month: 3, day: 18 }, count: 5 },
      ]);
      (EventRegistration.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: "user1",
          totalRegistrations: 5,
          user: { _id: "user1", name: "Alice" },
        },
      ]);
      (EventViews.aggregate as jest.Mock).mockResolvedValue([
        { views: 150, event: { _id: "event123", title: "Tech Conference" } },
      ]);
      (EventShare.countDocuments as jest.Mock).mockResolvedValue(50);
      (EventShare.aggregate as jest.Mock).mockResolvedValue([
        { _id: "Facebook", count: 10 },
      ]);
      (EventShare.aggregate as jest.Mock).mockResolvedValue([
        { _id: { year: 2024, month: 3, day: 18 }, count: 5 },
      ]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Dashboard fetched successfully");
      expect(res.body.data.userManagement.totalUsers).toBe(100);
      expect(res.body.data.eventManagement.totalEvents).toBe(50);
      expect(res.body.data.engagement.totalEventViews).toBe(200);
      expect(res.body.data.engagement.totalShares).toBe(50);
    });

    it("should return an error if non-admin tries to access", async () => {
      jest.mock("@/lib/server/middleware/guard", () => ({
        guard: jest.fn().mockResolvedValue({ role: "USER" }),
      }));

      const req = { method: "GET" };

      const res = (await GET(req as any)).json();

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });
});
