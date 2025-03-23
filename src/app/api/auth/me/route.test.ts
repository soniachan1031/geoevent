import { GET, PATCH, DELETE } from "./route";
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import { guard } from "@/lib/server/middleware/guard";
import { uploadImage } from "@/lib/server/s3UploadHandler";
import deleteProfileTemplate from "@/lib/server/email/templates/deleteProfileTemplate";

// Mock dependencies
jest.mock("@/mongoose/models/User", () => ({
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/s3UploadHandler", () => ({
  uploadImage: jest.fn(),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(),
}));
jest.mock("@/lib/server/email/templates/deleteProfileTemplate", () =>
  jest.fn()
);

describe("User API Routes", () => {
  let req: any;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      _id: "user123",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      bio: "This is a bio",
    };

    req = {
      user: mockUser,
      formData: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(JSON.stringify(mockUser)),
      }),
    };
  });

  describe("GET /api/auth/me", () => {
    it("should return the current user", async () => {
      // Mock the guard function to return the mock user
      (guard as jest.Mock).mockResolvedValue(mockUser);

      // Call the GET handler
      const res = await GET(req);
      const responseBody = await res.json(); // Parse the response

      // Assert response
      expect(res.status).toBe(200);
      expect(responseBody.message).toBe("success");
      expect(responseBody.data.doc).toEqual(mockUser);
    });
  });

  describe("PATCH /api/auth/me", () => {
    it("should update the user profile", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };

      // Mock the guard function and database update
      (guard as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
      (uploadImage as jest.Mock).mockResolvedValue(
        "https://example.com/image.jpg"
      );

      // Call the PATCH handler
      const res = await PATCH(req);
      const responseBody = await res.json(); // Parse the response

      // Assert response
      expect(res.status).toBe(200);
      expect(responseBody.message).toBe("profile updated");
      expect(responseBody.data.doc.name).toBe("Updated Name");
    });

    it("should update user profile without an image", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };

      // Mock the guard function and database update without image
      (guard as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      // Call the PATCH handler
      const res = await PATCH(req);
      const responseBody = await res.json(); // Parse the response

      // Assert response
      expect(res.status).toBe(200);
      expect(responseBody.message).toBe("profile updated");
      expect(responseBody.data.doc.name).toBe("Updated Name");
    });
  });

  describe("DELETE /api/auth/me", () => {
    it("should delete the user and send a confirmation email", async () => {
      // Mock the guard function and user deletion
      (guard as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
      (sendMail as jest.Mock).mockResolvedValue(true);
      (deleteProfileTemplate as jest.Mock).mockReturnValue(
        "<html>Profile deleted</html>"
      );

      // Call the DELETE handler
      const res = await DELETE(req);
      const responseBody = await res.json(); // Parse the response

      // Assert response
      expect(res.status).toBe(200);
      expect(responseBody.message).toBe("user deleted");
      expect(sendMail).toHaveBeenCalled();
      expect(deleteProfileTemplate).toHaveBeenCalledWith({
        user: mockUser,
        req,
      });
    });

    it("should return an error if user deletion fails", async () => {
      // Mock the guard function and simulate deletion failure
      (guard as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null); // Simulate deletion failure

      // Call the DELETE handler and expect it to throw an error
      const res = await DELETE(req);
      const responseBody = await res.json(); // Parse the response

      expect(res.status).toBe(500);
      expect(responseBody.message).toBe("user not deleted");
    });
  });
});
