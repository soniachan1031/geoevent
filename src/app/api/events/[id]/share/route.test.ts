import { POST, GET } from "./route"; // Import the POST and GET handlers
import Event from "@/mongoose/models/Event";
import EventShare from "@/mongoose/models/EventShare";
import getUser from "@/lib/server/getUser";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventShare");
jest.mock("@/lib/server/getUser", () => jest.fn());
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Mock unauthenticated user
  }),
}));

describe("Event Share API", () => {
  describe("POST /api/events/[id]/share", () => {
    it("should successfully share an event", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({ media: "Facebook" }),
      };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventShare.create as jest.Mock).mockResolvedValue({
        event: "event123",
        user: null,
        media: "Facebook",
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event shared successfully");
      expect(res.body.data.doc.media).toBe("Facebook");
    });

    it("should return an error if event does not exist", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({ media: "Twitter" }),
      };
      const params = { id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Event not found");
    });

    it("should return an error if media is missing", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({}),
      };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123" };
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("media is required");
    });

    it("should return an error if media type is invalid", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({ media: "InvalidMedia" }),
      };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123" };
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid media type: InvalidMedia");
    });

    it("should store the user ID if the user is authenticated", async () => {
      jest.mock("next/headers", () => ({
        cookies: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue("mockAuthToken"), // Mock authenticated user
        }),
      }));

      (getUser as jest.Mock).mockResolvedValue({ _id: "user123" });

      const req = {
        method: "POST",
        body: JSON.stringify({ media: "WhatsApp" }),
      };
      const params = { id: "event123" };

      const mockEvent = { _id: "event123" };
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventShare.create as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
        media: "WhatsApp",
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event shared successfully");
      expect(res.body.data.doc.user).toBe("user123");
    });
  });

  describe("GET /api/events/[id]/share", () => {
    it("should retrieve all shares for an event", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventShare.find as jest.Mock).mockResolvedValue([
        {
          user: { name: "John Doe", photo: "https://example.com/photo.jpg" },
          media: "Facebook",
        },
      ]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Shares retrieved");
      expect(res.body.data.docs.length).toBe(1);
      expect(res.body.data.docs[0].media).toBe("Facebook");
    });

    it("should return an empty array if no shares exist", async () => {
      const req = { method: "GET" };
      const params = { id: "event123" };

      (EventShare.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Shares retrieved");
      expect(res.body.data.docs).toEqual([]);
    });
  });
});
