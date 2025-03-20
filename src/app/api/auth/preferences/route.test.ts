import { PATCH } from "./route"; // Import the PATCH handler
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue("mockAuthToken"), // Mock authentication cookie
  }),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    email: "test@example.com",
    subscribeToEmails: false,
  }),
}));
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());

describe("User Preferences API", () => {
  it("should update user email subscription preference", async () => {
    const req = {
      method: "PATCH",
      body: JSON.stringify({ subscribeToEmails: true }),
    };

    const updatedUser = {
      _id: "user123",
      email: "test@example.com",
      subscribeToEmails: true,
    };

    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

    const res = await PATCH(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Preferences Updated");
    expect(res.body.data.doc.subscribeToEmails).toBe(true);
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return error if subscribeToEmails is not a boolean", async () => {
    const req = {
      method: "PATCH",
      body: JSON.stringify({ subscribeToEmails: "invalid" }),
    };

    const res = (await PATCH(req as any)).json();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid value for subscribeToEmails");
  });

  it("should return error if user is not found", async () => {
    const req = {
      method: "PATCH",
      body: JSON.stringify({ subscribeToEmails: true }),
    };

    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const res = (await PATCH(req as any)).json();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("User not found");
  });

  it("should handle email sending failure gracefully", async () => {
    const req = {
      method: "PATCH",
      body: JSON.stringify({ subscribeToEmails: false }),
    };

    const updatedUser = {
      _id: "user123",
      email: "test@example.com",
      subscribeToEmails: false,
    };

    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
    (sendMail as jest.Mock).mockRejectedValue(
      new Error("Email sending failed")
    );

    const res = await PATCH(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Preferences Updated");
    expect(res.body.data.doc.subscribeToEmails).toBe(false);
  });
});
