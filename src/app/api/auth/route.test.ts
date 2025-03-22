import { POST, DELETE } from "./route";
import User from "@/mongoose/models/User";
import { verifyEncryptedString } from "@/lib/server/encryptionHandler";
import { setAuthCookie, removeAuthCookie } from "@/lib/server/cookieHandler";
import { guard } from "@/lib/server/middleware/guard";

// Mocks
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/encryptionHandler", () => ({
  verifyEncryptedString: jest.fn(),
}));
jest.mock("@/lib/server/cookieHandler", () => ({
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    const baseUrl = "http://localhost/api/auth/login";

    it("should login successfully", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        disabled: false,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (verifyEncryptedString as jest.Mock).mockResolvedValue(true);

      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockUser.email, password: "test123" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe("login successful");
      expect(setAuthCookie).toHaveBeenCalledWith("user123");
    });

    it("should return error if email is missing", async () => {
      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "test123" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.message).toBe("email is required");
    });

    it("should return error if password is missing", async () => {
      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.message).toBe("password is required");
    });

    it("should return error if user not found", async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "test123",
        }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.message).toBe("user not found");
    });

    it("should return error if user is disabled", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        disabled: true,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockUser.email, password: "test123" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.message).toBe("unauthorized");
    });

    it("should return error if password is incorrect", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        disabled: false,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (verifyEncryptedString as jest.Mock).mockResolvedValue(false);

      const req = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockUser.email, password: "wrongPass" }),
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.message).toBe("invalid credentials");
      expect(removeAuthCookie).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const req = new Request("http://localhost/api/auth/logout", {
        method: "DELETE",
      });

      const res = await DELETE(req as any);
      const data = await res.json();

      expect(guard).toHaveBeenCalledWith(req);
      expect(removeAuthCookie).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(data.message).toBe("logout successful");
    });
  });
});
