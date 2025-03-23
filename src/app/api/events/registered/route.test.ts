import { GET } from "./route";
import EventRegistration from "@/mongoose/models/EventRegistration";
import { guard } from "@/lib/server/middleware/guard";

// Mocks
jest.mock("@/mongoose/models/EventRegistration");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("GET /api/events/registered", () => {
  const mockReq = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return registered events successfully", async () => {
    const mockUser = { _id: "user123" };

    (guard as jest.Mock).mockResolvedValue(mockUser);

    const mockRegistrations = [
      {
        _id: "reg1",
        event: { _id: "event1", title: "Event One" },
        user: "user123",
      },
      {
        _id: "reg2",
        event: { _id: "event2", title: "Event Two" },
        user: "user123",
      },
    ];

    (EventRegistration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRegistrations),
    });

    const res = await GET(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Registered events");
    expect(data.data.docs).toHaveLength(2);
    expect(data.data.docs[0].event.title).toBe("Event One");
  });

  it("should return empty array if user has no registrations", async () => {
    const mockUser = { _id: "user123" };

    (guard as jest.Mock).mockResolvedValue(mockUser);

    (EventRegistration.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    const res = await GET(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Registered events");
    expect(data.data.docs).toEqual([]);
  });
});
