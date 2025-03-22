import { POST, DELETE } from "./route";
import Event from "@/mongoose/models/Event";
import EventRegistration from "@/mongoose/models/EventRegistration";
import { guard } from "@/lib/server/middleware/guard";
import sendMail from "@/lib/server/email/sendMail";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/lib/server/middleware/guard", () => ({ guard: jest.fn() }));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/connectDB", () => jest.fn());
jest.mock("@/lib/server/urlGenerator", () => ({
  getSiteURL: () => "https://localhost",
}));
jest.mock("@/lib/server/email/templates/eventSuccessTemplate", () =>
  jest.fn(() => "<html>confirmation</html>")
);

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("POST /api/events/:id/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should register user for a valid event", async () => {
    const user = { _id: "user123", email: "test@example.com" };
    const event = {
      _id: "event123",
      date: new Date(Date.now() + 86400000),
      registrationDeadline: new Date(Date.now() + 86400000),
      organizer: "organizer999",
    };

    (guard as jest.Mock).mockResolvedValue(user);
    (Event.findById as jest.Mock).mockResolvedValue(event);
    (EventRegistration.findOne as jest.Mock).mockResolvedValue(null);
    (EventRegistration.create as jest.Mock).mockResolvedValue({
      event: event._id,
      user: user._id,
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Event registration successful");
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return 400 if already registered", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event123",
      date: new Date(Date.now() + 86400000),
      organizer: "organizer999",
    });
    (EventRegistration.findOne as jest.Mock).mockResolvedValue(true);

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Already registered for event");
  });

  it("should return 400 if organizer tries to register", async () => {
    const user = { _id: "organizer123" };
    (guard as jest.Mock).mockResolvedValue(user);
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event123",
      date: new Date(Date.now() + 86400000),
      organizer: "organizer123",
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Organizer cannot register for event");
  });

  it("should return 400 if registration deadline has passed", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue({
      _id: "event123",
      date: new Date(Date.now() + 86400000),
      registrationDeadline: new Date(Date.now() - 86400000),
      organizer: "organizer999",
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Registration deadline has passed");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockReq, { params: createParams("invalid") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("Event not found");
  });
});

describe("DELETE /api/events/:id/register", () => {
  it("should unregister user from event", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (EventRegistration.findOneAndDelete as jest.Mock).mockResolvedValue({
      _id: "reg1",
    });

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Event unregistration successful");
  });

  it("should return 400 if user was not registered", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (EventRegistration.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Not registered for event");
  });
});
