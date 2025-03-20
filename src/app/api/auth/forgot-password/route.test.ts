import { POST } from "./route"; // Import the POST handler from your route
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import jwt from "jsonwebtoken";

// Mock cookies and email sender to prevent actual database changes and emails during testing
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Mock authentication cookie as null
  }),
}));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/mongoose/models/User");

describe("Forgot Password API", () => {
  it("should send a password reset link when email is valid", async () => {
    // Mock request data
    const req = {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    };

    // Mock user data
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
    };

    // Mock database calls
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue("mockToken");

    // Call the POST handler
    const res = await POST(req as any);

    // Assert response
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("password reset link sent to your email");
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return error if email is not provided", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ email: "" }), // Empty email
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("email is required");
  });

  it("should return error if email format is invalid", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }), // Invalid email
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("not a valid email");
  });

  it("should return error if user does not exist", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com" }),
    };

    (User.findOne as jest.Mock).mockResolvedValue(null);

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("user not found");
  });

  it("should return error if user is already logged in", async () => {
    jest.mock("next/headers", () => ({
      cookies: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue("mockAuthToken"), // Simulate logged-in user
      }),
    }));

    const req = {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("user is already logged in");
  });

  it("should return error if email sending fails", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue("mockToken");

    (sendMail as jest.Mock).mockRejectedValue(
      new Error("Email sending failed")
    );

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("failed to send password reset link");
  });
});
