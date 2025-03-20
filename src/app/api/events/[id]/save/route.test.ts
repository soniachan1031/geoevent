import { POST, DELETE } from "./route"; // Import the POST and DELETE handlers
import Event from "@/mongoose/models/Event";
import SavedEvent from "@/mongoose/models/SavedEvent";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/SavedEvent");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
  }),
}));

describe("Event Save API", () => {
  describe("POST /api/events/[id]/save", () => {
    it("should successfully save an event for the user", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (SavedEvent.findOneAndUpdate as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("event saved");
    });

    it("should return an error if event does not exist", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("event not found");
    });
  });

  describe("DELETE /api/events/[id]/save", () => {
    it("should successfully unsave an event", async () => {
      const req = { method: "DELETE" };
      const params = { id: "event123" };

      (SavedEvent.findOneAndDelete as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = await DELETE(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event unsaved");
    });

    it("should return an error if event was not saved", async () => {
      const req = { method: "DELETE" };
      const params = { id: "event123" };

      (SavedEvent.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const res = (await DELETE(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Event is not saved");
    });
  });
});
