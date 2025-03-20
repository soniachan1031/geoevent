import { GET } from "./route"; // Import the GET handler
import EventRegistration from "@/mongoose/models/EventRegistration";

// Mock dependencies
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
  }),
}));

describe("Registered Events API", () => {
  describe("GET /api/events/registered", () => {
    it("should retrieve all registered events for the user", async () => {
      const req = { method: "GET" };

      (EventRegistration.find as jest.Mock).mockResolvedValue([
        { event: { _id: "event123", title: "Test Event" }, user: "user123" },
      ]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Registered events");
      expect(res.body.data.docs.length).toBe(1);
      expect(res.body.data.docs[0].event.title).toBe("Test Event");
    });

    it("should return an empty array if user has no registered events", async () => {
      const req = { method: "GET" };

      (EventRegistration.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Registered events");
      expect(res.body.data.docs).toEqual([]);
    });
  });
});
