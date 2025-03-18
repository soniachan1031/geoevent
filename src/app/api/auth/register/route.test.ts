import { POST } from "./route"; // Import the POST handler
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import { setAuthCookie } from "@/lib/server/cookieHandler";
import { EUserRole } from "@/types/user.types";

// Mock dependencies
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/cookieHandler", () => ({
  setAuthCookie: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("User Registration API", () => {
  it("should successfully register a new user", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    const mockNewUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      password: undefined, // Password should be removed in the response
      role: EUserRole.USER,
    };

    (User.findOne as jest.Mock).mockResolvedValue(null); // Simulate user does not exist
    (User.create as jest.Mock).mockResolvedValue(mockNewUser);

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("registration successful");
    expect(res.body.data.doc.email).toBe("john@example.com");
    expect(setAuthCookie).toHaveBeenCalledWith("user123");
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return an error if name is missing", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("name is required");
  });

  it("should return an error if email is missing", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
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
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("not a valid email");
  });

  it("should return an error if passwords do not match", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password456",
      }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("passwords don't match");
  });

  it("should return an error if user already exists", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    (User.findOne as jest.Mock).mockResolvedValue({
      email: "john@example.com",
    });

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("user with email already exists");
  });

  it("should handle email sending failure gracefully", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    const mockNewUser = {
      _id: "user123",
      name: "John Doe",
      email: "john@example.com",
      password: undefined,
      role: EUserRole.USER,
    };

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(mockNewUser);
    (sendMail as jest.Mock).mockRejectedValue(
      new Error("Email sending failed")
    );

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("registration successful");
    expect(res.body.data.doc.email).toBe("john@example.com");
    expect(setAuthCookie).toHaveBeenCalledWith("user123");
  });
});
