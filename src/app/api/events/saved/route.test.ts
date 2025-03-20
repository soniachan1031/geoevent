import { GET } from "./route"; // Import the GET handler
import SavedEvent from "@/mongoose/models/SavedEvent";

// Mock dependencies
jest.mock("@/mongoose/models/SavedEvent");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
  }),
}));

describe("Saved Events API", () => {
  describe("GET /api/events/saved", () => {
    it("should retrieve all saved events for the user", async () => {
      const req = { method: "GET" };

      (SavedEvent.find as jest.Mock).mockResolvedValue([
        { event: { _id: "event123", title: "Test Event" }, user: "user123" },
      ]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Saved events");
      expect(res.body.data.docs.length).toBe(1);
      expect(res.body.data.docs[0].event.title).toBe("Test Event");
    });

    it("should return an empty array if user has no saved events", async () => {
      const req = { method: "GET" };

      (SavedEvent.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Saved events");
      expect(res.body.data.docs).toEqual([]);
    });
  });
});
