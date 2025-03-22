import { PATCH } from "./route";
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import { guard } from "@/lib/server/middleware/guard";
import emailSubscriptionTemplate from "@/lib/server/email/templates/emailSubscriptionTemplate";

// Mock dependencies
jest.mock("@/mongoose/models/User", () => ({
  findByIdAndUpdate: jest.fn(),
}));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/reqParser", () => ({
  parseJson: jest.fn().mockResolvedValue({
    subscribeToEmails: true,
  }), // Mocking the parseJson method to return valid body data
}));
jest.mock("@/lib/server/email/templates/emailSubscriptionTemplate", () =>
  jest.fn()
);

describe("PATCH /api/auth/preferences", () => {
  let req: Request;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      _id: "user123",
      email: "john.doe@example.com",
      subscribeToEmails: false,
    };

    req = new Request("http://localhost/api/auth/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribeToEmails: true,
      }),
    });
  });

  it("should update user preferences and send a confirmation email", async () => {
    const updatedUser = { ...mockUser, subscribeToEmails: true };

    // Mock dependencies
    (guard as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
    (sendMail as jest.Mock).mockResolvedValue(true);
    (emailSubscriptionTemplate as jest.Mock).mockReturnValue(
      "<html>Email Subscribed</html>"
    );

    // Call the PATCH handler
    const res = await PATCH(req);
    const responseBody = await res.json(); // Parse the response

    // Assert response
    expect(res.status).toBe(200);
    expect(responseBody.message).toBe("Preferences Updated");
    expect(responseBody.data.doc.subscribeToEmails).toBe(true);
    expect(sendMail).toHaveBeenCalled();
    expect(emailSubscriptionTemplate).toHaveBeenCalledWith({
      user: updatedUser,
      req,
    });
  });

  it("should return an error if the user is not found", async () => {
    // Mock user not found
    (guard as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null); // Simulate user not found

    // Call the PATCH handler and expect it to throw an error
    const res = await PATCH(req);
    const responseBody = await res.json(); // Parse the response

    expect(res.status).toBe(500);
    expect(responseBody.message).toBe("User not found");
  });

});
