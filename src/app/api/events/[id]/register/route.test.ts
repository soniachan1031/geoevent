import { POST, DELETE } from "./route"; // Import the POST and DELETE handlers
import Event from "@/mongoose/models/Event";
import EventRegistration from "@/mongoose/models/EventRegistration";
import sendMail from "@/lib/server/email/sendMail";

// Mock dependencies
jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    email: "test@example.com",
  }),
}));
jest.mock("@/lib/server/urlGenerator", () => ({
  getSiteURL: jest.fn().mockReturnValue("https://example.com"),
}));

describe("Event Registration API", () => {
  describe("POST /api/events/[id]/register", () => {
    it("should successfully register a user for an event", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Future event
        registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 12),
        organizer: "otherUser",
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventRegistration.findOne as jest.Mock).mockResolvedValue(null);
      (EventRegistration.create as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = await POST(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event registration successful");
      expect(sendMail).toHaveBeenCalled();
    });

    it("should return an error if event does not exist", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Event not found");
    });

    it("should return an error if event date has passed", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Past event
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Event date has passed");
    });

    it("should return an error if registration deadline has passed", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        registrationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 1), // Past deadline
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Registration deadline has passed");
    });

    it("should return an error if the user is the event organizer", async () => {
      jest.mock("@/lib/server/middleware/guard", () => ({
        guard: jest.fn().mockResolvedValue({
          _id: "organizer123",
        }),
      }));

      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        organizer: "organizer123", // User is the organizer
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Organizer cannot register for event");
    });

    it("should return an error if user is already registered", async () => {
      const req = { method: "POST" };
      const params = { id: "event123" };

      const mockEvent = {
        _id: "event123",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        organizer: "otherUser",
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (EventRegistration.findOne as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = (await POST(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Already registered for event");
    });
  });

  describe("DELETE /api/events/[id]/register", () => {
    it("should successfully unregister a user from an event", async () => {
      const req = { method: "DELETE" };
      const params = { id: "event123" };

      (EventRegistration.findOneAndDelete as jest.Mock).mockResolvedValue({
        event: "event123",
        user: "user123",
      });

      const res = await DELETE(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event unregistration successful");
    });

    it("should return an error if user is not registered", async () => {
      const req = { method: "DELETE" };
      const params = { id: "event123" };

      (EventRegistration.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const res = (await DELETE(req as any, { params } as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Not registered for event");
    });
  });
});
