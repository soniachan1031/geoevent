import { POST } from "./route"; // Import the POST handler from your route
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Import cookies

// Mock dependencies
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/mongoose/models/User", () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("Forgot Password API", () => {
  it("should send a password reset link when email is valid", async () => {
    // Mock request data
    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user123@gmail.com",
      }),
    });

    // Mock user data
    const mockUser = {
      _id: "user123",
      email: "user123@gmail.com",
    };

    // Mock database calls
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockResolvedValue("mockToken");

    // Mock the cookies function to return null (simulate no logged-in user)
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    // Call the POST handler
    const res = await POST(req as any);
    const response = await res.json(); // Parse the response

    // Assert response
    expect(res.status).toBe(200);
    expect(response.message).toBe("password reset link sent to your email");
    expect(sendMail).toHaveBeenCalled();
  });
});
