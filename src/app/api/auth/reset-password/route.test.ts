import { POST } from "./route"; // Import the POST handler

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Mock authentication cookie as null
  }),
}));
jest.mock("@/lib/server/encryptionHandler", () => ({
  encryptString: jest.fn().mockResolvedValue("encryptedPassword"),
}));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/getUser", () => jest.fn());
jest.mock("@/mongoose/models/User");
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());

describe("Reset Password API", () => {
  it("should return error if password is missing", async () => {
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passwordResetToken: "validToken",
      }),
    });

    const res = await POST(req as any);
    const data = await res.json(); // Access the response data

    expect(res.status).toBe(400);
    expect(data.message).toBe("password is required");
  });

  it("should return error if password reset token is missing", async () => {
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: "newSecurePassword",
      }),
    });

    const res = await POST(req as any);
    const data = await res.json(); // Access the response data

    expect(res.status).toBe(400);
    expect(data.message).toBe("password reset token is required");
  });
});
