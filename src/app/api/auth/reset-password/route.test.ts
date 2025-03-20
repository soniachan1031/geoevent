import { POST } from "./route"; // Import the POST handler
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import jwt from "jsonwebtoken";
import { encryptString } from "@/lib/server/encryptionHandler";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Mock authentication cookie as null
  }),
}));
jest.mock("@/lib/server/encryptionHandler", () => ({
  encryptString: jest.fn().mockResolvedValue("encryptedPassword"),
}));
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Reset Password API", () => {
  it("should successfully reset password", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      passwordResetToken: "validToken",
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour ahead
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("password reset successful");
    expect(encryptString).toHaveBeenCalledWith("newSecurePassword");
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return error if password is missing", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        passwordResetToken: "validToken",
      }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("password is required");
  });

  it("should return error if password reset token is missing", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
      }),
    };

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("password reset token is required");
  });

  it("should return error for invalid password reset token", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "invalidToken",
      }),
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid password reset token");
  });

  it("should return error if user is not found", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(null);

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("user not found");
  });

  it("should return error if password reset token does not match user's record", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      passwordResetToken: "differentToken",
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid password reset token");
  });

  it("should return error if password reset token has expired", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      passwordResetToken: "validToken",
      passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000), // Expired 1 hour ago
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("password reset token expired");
  });

  it("should return error if password update fails", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      passwordResetToken: "validToken",
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("failed to update user");
  });

  it("should return error if email sending fails", async () => {
    const req = {
      method: "POST",
      body: JSON.stringify({
        password: "newSecurePassword",
        passwordResetToken: "validToken",
      }),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      passwordResetToken: "validToken",
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
    (sendMail as jest.Mock).mockRejectedValue(
      new Error("Email sending failed")
    );

    const res = (await POST(req as any)).json();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("failed to send email");
  });
});
