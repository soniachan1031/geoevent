import { POST, GET } from "./route";
import Event from "@/mongoose/models/Event";
import EventViews from "@/mongoose/models/EventViews";
import getUser from "@/lib/server/getUser";

jest.mock("@/mongoose/models/Event");
jest.mock("@/mongoose/models/EventViews");
jest.mock("@/lib/server/getUser", () => jest.fn());
jest.mock("@/lib/server/connectDB", () => jest.fn());
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: "auth-token" }),
  }),
}));

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("POST /api/events/:id/views", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should increment views if user is not organizer", async () => {
    const event = { _id: "event123", organizer: "organizer456" };
    const user = { _id: "user789" };

    (Event.findById as jest.Mock).mockResolvedValue(event);
    (getUser as jest.Mock).mockResolvedValue(user);
    (EventViews.findOneAndUpdate as jest.Mock).mockResolvedValue({
      event: event._id,
      views: 5,
    });

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("views added");
    expect(data.data.doc.views).toBe(5);
  });

  it("should return 400 if user is organizer", async () => {
    const event = { _id: "event123", organizer: "user123" };
    const user = { _id: "user123" };

    (Event.findById as jest.Mock).mockResolvedValue(event);
    (getUser as jest.Mock).mockResolvedValue(user);

    const res = await POST(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("organizer cannot add views to own event");
  });

  it("should return 404 if event not found", async () => {
    (Event.findById as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockReq, { params: createParams("invalid") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("event not found");
  });
});

describe("GET /api/events/:id/views", () => {
  it("should retrieve views for the event", async () => {
    const views = [{ _id: "v1", event: "event123", views: 3 }];

    (EventViews.find as jest.Mock).mockResolvedValue(views);

    const res = await GET(mockReq, { params: createParams("event123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("feedbacks retrieved");
    expect(data.data.docs).toEqual(views);
  });
});
