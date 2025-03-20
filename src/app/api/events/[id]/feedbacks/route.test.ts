import { POST, GET } from "./route"; // Import the POST and GET handlers
import Event from "@/mongoose/models/Event";
import EventFeedback from "@/mongoose/models/EventFeedback";
import EventRegistration from "@/mongoose/models/EventRegistration";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventFeedback");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    name: "Test User",
  }),
}));

describe("Event Feedback API", () => {
  describe("POST /api/events/[id]/feedbacks", () => {
    it("should allow registered users to leave feedback for a past event", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          rating: 5,
          review: "Great event!",
        }),
      };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Past event
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventRegistration.findOne as jest.Mock).mockResolvedValue({}); // User registered
      (EventFeedback.findOne as jest.Mock).mockResolvedValue(null); // No previous feedback
      (EventFeedback.create as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
        rating: 5,
        review: "Great event!",
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("feedback saved");
      expect(res.body.data.doc.rating).toBe(5);
    });

    it("should return an error if event does not exist", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("event not found");
    });

    it("should return an error if event is still ongoing", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Future event
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Event has not ended yet, feedback not allowed."
      );
    });

    it("should return an error if user is not registered for the event", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Past event
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventRegistration.findOne as jest.Mock).mockResolvedValue(null); // User not registered

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("not registered for event yet");
    });

    it("should return an error if user has already left feedback", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Past event
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventRegistration.findOne as jest.Mock).mockResolvedValue({});
      (EventFeedback.findOne as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("feedback already left");
    });
  });

  describe("GET /api/events/[id]/feedbacks", () => {
    it("should retrieve all feedbacks for an event", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventFeedback.find as jest.Mock).mockResolvedValue([
        {
          user: { name: "John Doe", photo: "https://example.com/photo.jpg" },
          rating: 5,
          review: "Amazing event!",
        },
      ]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("feedbacks retrieved");
      expect(res.body.data.docs.length).toBe(1);
      expect(res.body.data.docs[0].rating).toBe(5);
    });

    it("should return an empty array if no feedbacks exist", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventFeedback.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("feedbacks retrieved");
      expect(res.body.data.docs).toEqual([]);
    });
  });
});
