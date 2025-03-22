import { POST, DELETE } from "./route";
import Event from "@/mongoose/models/Event";
import SavedEvent from "@/mongoose/models/SavedEvent";
import { guard } from "@/lib/server/middleware/guard";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/SavedEvent");
jest.mock("@/lib/server/middleware/guard", () => ({ guard: jest.fn() }));
jest.mock("@/lib/server/connectDB", () => jest.fn());

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("POST /api/events/:id/save", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should save event for user", async () => {
    const user = { _id: "user123" };
    const event = { _id: "event123", title: "Sample Event" };

    (guard as jest.Mock).mockResolvedValue(user);
    (Event.findById as jest.Mock).mockResolvedValue(event);
    (SavedEvent.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: "saved1",
      event: event._id,
      user: user._id,
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("event saved");
  });

  it("should return 404 if event not found", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockReq, { params: createParams("event404") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });
});

describe("DELETE /api/events/:id/save", () => {
  it("should unsave event for user", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (SavedEvent.findOneAndDelete as jest.Mock).mockResolvedValue({
      _id: "saved1",
    });

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Event unsaved");
  });

  it("should return 400 if event is not saved", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "user123" });
    (SavedEvent.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("Event is not saved");
  });
});
