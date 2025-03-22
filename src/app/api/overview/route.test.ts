import { GET } from "./route";
import { guard } from "@/lib/server/middleware/guard";
import User from "@/mongoose/models/User";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import EventRegistration from "@/mongoose/models/EventRegistration";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventShare from "@/mongoose/models/EventShare";

jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/mongoose/models/User");
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("GET /api/overview", () => {
  const mockReq = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return dashboard data for admin", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "admin123", role: "admin" });

    (User.countDocuments as jest.Mock).mockResolvedValue(10);
    (User.countDocuments as jest.Mock).mockResolvedValue(2); // for new users this month

    (Event.countDocuments as jest.Mock).mockResolvedValueOnce(5); // total
    (Event.countDocuments as jest.Mock).mockResolvedValueOnce(2); // completed
    (Event.countDocuments as jest.Mock).mockResolvedValueOnce(3); // upcoming

    (Event.aggregate as jest.Mock).mockResolvedValue([
      { _id: "Tech", count: 3 },
    ]);
    (EventRegistration.aggregate as jest.Mock).mockResolvedValue([
      { eventId: "event1", title: "Event 1", registrations: 5 },
    ]);

    (EventViews.aggregate as jest.Mock).mockResolvedValue([{ views: 20 }]);
    (EventFeedback.countDocuments as jest.Mock).mockResolvedValue(4);
    (EventFeedback.aggregate as jest.Mock)
      .mockResolvedValueOnce([{ average: 4.5 }]) // avg
      .mockResolvedValueOnce([{ _id: 5, count: 2 }]); // rating dist

    (EventRegistration.aggregate as jest.Mock)
      .mockResolvedValueOnce([]) // registrations over time
      .mockResolvedValueOnce([
        { userId: "user1", userName: "Alice", totalRegistrations: 3 },
      ]); // most engaged

    (EventViews.aggregate as jest.Mock).mockResolvedValue([
      { eventId: "event1", title: "Popular Event", views: 20 },
    ]);

    (EventShare.countDocuments as jest.Mock).mockResolvedValue(5);
    (EventShare.aggregate as jest.Mock)
      .mockResolvedValueOnce([{ _id: "Facebook", count: 3 }]) // by media
      .mockResolvedValueOnce([]); // over time

    (EventRegistration.distinct as jest.Mock).mockResolvedValue(["user1"]);
    (EventFeedback.distinct as jest.Mock).mockResolvedValue(["user2"]);

    const res = await GET(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Dashboard fetched successfully");
    expect(data.data.userManagement.totalUsers).toBe(2);
    expect(data.data.engagement.totalShares).toBe(5);
  });
});
