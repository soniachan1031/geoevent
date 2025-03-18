import { POST, GET } from "./route"; // Import the POST and GET handlers
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import getUser from "@/lib/server/getUser";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/lib/server/getUser", () => jest.fn());
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Mock unauthenticated user
  }),
}));

describe("Event Views API", () => {
  describe("POST /api/events/[id]/views", () => {
    it("should successfully add a view to an event", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123", organizer: "user456" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventViews.findOneAndUpdate as jest.Mock).mockResolvedValue({
        event: "event123",
        views: 1,
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("views added");
      expect(res.body.data.doc.views).toBe(1);
    });

    it("should return an error if event does not exist", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("event not found");
    });

    it("should return an error if user is the organizer", async () => {
      jest.mock("next/headers", () => ({
        cookies: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue("mockAuthToken"), // Mock authenticated user
        }),
      }));

      (getUser as jest.Mock).mockResolvedValue({ _id: "organizer123" });

      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123", organizer: "organizer123" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("organizer cannot add views to own event");
    });
  });

  describe("GET /api/events/[id]/views", () => {
    it("should retrieve all views for an event", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventViews.find as jest.Mock).mockResolvedValue([
        { event: "event123", views: 10 },
      ]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("feedbacks retrieved");
      expect(res.body.data.docs.length).toBe(1);
      expect(res.body.data.docs[0].views).toBe(10);
    });

    it("should return an empty array if no views exist", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventViews.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("feedbacks retrieved");
      expect(res.body.data.docs).toEqual([]);
    });
  });
});
