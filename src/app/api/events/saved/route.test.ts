import { GET } from "./route";
import SavedEvent from "@/mongoose/models/SavedEvent";
import { guard } from "@/lib/server/middleware/guard";

// Mocks
jest.mock("@/mongoose/models/SavedEvent");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("GET /api/events/saved", () => {
  const mockReq = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return saved events successfully", async () => {
    const mockUser = { _id: "user123" };

    (guard as jest.Mock).mockResolvedValue(mockUser);

    const mockSavedEvents = [
      {
        _id: "saved1",
        event: { _id: "event1", title: "Event One" },
        user: "user123",
      },
      {
        _id: "saved2",
        event: { _id: "event2", title: "Event Two" },
        user: "user123",
      },
    ];

    (SavedEvent.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockSavedEvents),
    });

    const res = await GET(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Saved events");
    expect(data.data.docs).toHaveLength(2);
    expect(data.data.docs[0].event.title).toBe("Event One");
  });

  it("should return empty array if user has no saved events", async () => {
    const mockUser = { _id: "user123" };

    (guard as jest.Mock).mockResolvedValue(mockUser);

    (SavedEvent.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    const res = await GET(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Saved events");
    expect(data.data.docs).toEqual([]);
  });
});
