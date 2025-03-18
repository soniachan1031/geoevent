import { POST, DELETE } from "./route"; // Import the POST and DELETE handlers
import User from "@/mongoose/models/User";
import { verifyEncryptedString } from "@/lib/server/encryptionHandler";
import { removeAuthCookie, setAuthCookie } from "@/lib/server/cookieHandler";

// Mock dependencies
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/encryptionHandler", () => ({
  verifyEncryptedString: jest.fn(),
}));
jest.mock("@/lib/server/cookieHandler", () => ({
  removeAuthCookie: jest.fn(),
  setAuthCookie: jest.fn(),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    email: "test@example.com",
  }),
}));

describe("User Authentication API", () => {
  describe("Login API", () => {
    it("should log in user successfully", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "securepassword",
        }),
      };

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "encryptedPassword",
        disabled: false,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (verifyEncryptedString as jest.Mock).mockResolvedValue(true);

      const res = await POST(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("login successful");
      expect(res.body.data.doc.email).toBe("test@example.com");
      expect(setAuthCookie).toHaveBeenCalledWith("user123");
    });

    it("should return an error if email is missing", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          password: "securepassword",
        }),
      };

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("email is required");
    });

    it("should return an error if email is invalid", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "securepassword",
        }),
      };

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("not a valid email");
    });

    it("should return an error if password is missing", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
        }),
      };

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("password is required");
    });

    it("should return an error if user is not found", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "securepassword",
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("user not found");
    });

    it("should return an error if user is disabled", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "securepassword",
        }),
      };

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "encryptedPassword",
        disabled: true,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("unauthorized");
    });

    it("should return an error if password is incorrect", async () => {
      const req = {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      };

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "encryptedPassword",
        disabled: false,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (verifyEncryptedString as jest.Mock).mockResolvedValue(false);

      const res = (await POST(req as any)).json();

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("invalid credentials");
      expect(removeAuthCookie).toHaveBeenCalled();
    });
  });

  describe("Logout API", () => {
    it("should log out user successfully", async () => {
      const req = { method: "DELETE" };

      const res = await DELETE(req as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("logout successful");
      expect(removeAuthCookie).toHaveBeenCalled();
    });
  });
});
