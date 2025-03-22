import { GET } from "./route";
import User from "@/mongoose/models/User";
import { guard } from "@/lib/server/middleware/guard";

jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("GET /api/users", () => {
  const createRequest = (query = "") =>
    new Request(`http://localhost/api/users${query}`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated users for admin", async () => {
    (guard as jest.Mock).mockResolvedValue({ _id: "admin123", role: "admin" });

    const mockUsers = [
      { _id: "user1", name: "John" },
      { _id: "user2", name: "Jane" },
    ];

    (User.countDocuments as jest.Mock).mockResolvedValue(2);
    (User.find as jest.Mock).mockReturnValue({
      skip: () => ({
        limit: () => mockUsers,
      }),
    });

    const res = await GET(createRequest("?page=1&limit=2"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Users fetched successfully");
    expect(data.data.docs).toHaveLength(2);
    expect(data.data.pagination.total).toBe(2);
  });
});
