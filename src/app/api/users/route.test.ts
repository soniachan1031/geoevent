import { GET } from "./route"; // Import the GET handler
import User from "@/mongoose/models/User";
 
// Mock dependencies
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({ role: "ADMIN" }),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("Get All Users API", () => {
  describe("GET /api/users", () => {
    it("should retrieve all users with pagination", async () => {
      const req = {
        method: "GET",
        url: "http://localhost/api/users?page=1&limit=2",
      };

      const mockUsers = [
        { _id: "user123", name: "Alice", role: "USER" },
        { _id: "user456", name: "Bob", role: "USER" },
      ];

      (User.countDocuments as jest.Mock).mockResolvedValue(10);
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Users fetched successfully");
      expect(res.body.data.docs.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(10);
      expect(res.body.data.pagination.pages).toBe(5);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });

    it("should return an empty list if no users match the search query", async () => {
      const req = {
        method: "GET",
        url: "http://localhost/api/users?search=NotFound",
      };

      (User.countDocuments as jest.Mock).mockResolvedValue(0);
      (User.find as jest.Mock).mockResolvedValue([]);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Users fetched successfully");
      expect(res.body.data.docs).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
      expect(res.body.data.pagination.pages).toBe(0);
    });

    it("should search users by name", async () => {
      const req = {
        method: "GET",
        url: "http://localhost/api/users?search=Alice",
      };

      const mockUsers = [{ _id: "user123", name: "Alice", role: "USER" }];

      (User.countDocuments as jest.Mock).mockResolvedValue(1);
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.data.docs[0].name).toBe("Alice");
    });

    it("should search users by ID", async () => {
      const req = {
        method: "GET",
        url: "http://localhost/api/users?search=63f94f0c20a2d52a5c0e37f4",
      };

      const mockUsers = [
        { _id: "63f94f0c20a2d52a5c0e37f4", name: "Charlie", role: "USER" },
      ];

      (User.countDocuments as jest.Mock).mockResolvedValue(1);
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.data.docs[0]._id).toBe("63f94f0c20a2d52a5c0e37f4");
    });

    it("should exclude admin users from the results", async () => {
      const req = {
        method: "GET",
        url: "http://localhost/api/users",
      };

      const mockUsers = [
        { _id: "user123", name: "Alice", role: "USER" },
        { _id: "user456", name: "Bob", role: "USER" },
      ];

      (User.countDocuments as jest.Mock).mockResolvedValue(2);
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const res = await GET(req as any);

      expect(res.status).toBe(200);
      expect(res.body.data.docs.length).toBe(2);
      expect(res.body.data.docs.some((u) => u.role === "ADMIN")).toBe(false);
    });
  });
});
