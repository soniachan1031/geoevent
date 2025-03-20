import { GET, PATCH, DELETE } from "./route"; // Import the API handlers
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import { uploadImage } from "@/lib/server/s3UploadHandler";

// Mock dependencies
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/s3UploadHandler", () => ({
  uploadImage: jest.fn(),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({ role: "ADMIN" }),
}));

describe("User Management API", () => {
  describe("GET /api/users/:id", () => {
    it("should retrieve user details", async () => {
      const req = { method: "GET" };
      const params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await GET(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("user retrieved");
      expect(res.body.data.doc.email).toBe("john@example.com");
    });

    it("should return an error if user is not found", async () => {
      const req = { method: "GET" };
      const params = { id: "user123" };

      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = (await GET(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("user not found");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should update user profile", async () => {
      const req = {
        method: "PATCH",
        formData: async () => {
          const formData = new FormData();
          formData.append(
            "data",
            JSON.stringify({ name: "Updated User", bio: "Updated bio" })
          );
          formData.append(
            "photo",
            new Blob(["image-content"], { type: "image/png" })
          );
          return formData;
        },
      };
      const params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (uploadImage as jest.Mock).mockResolvedValue(
        "https://example.com/new-photo.jpg"
      );

      const updatedUser = {
        _id: "user123",
        name: "Updated User",
        email: "john@example.com",
        bio: "Updated bio",
        photo: { url: "https://example.com/new-photo.jpg", alt: "Updated User" },
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const res = await PATCH(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("profile updated");
      expect(res.body.data.doc.name).toBe("Updated User");
      expect(res.body.data.doc.photo.url).toBe(
        "https://example.com/new-photo.jpg"
      );
    });

    it("should return an error if user is not found", async () => {
      const req = { method: "PATCH" };
      const params = { id: "user123" };

      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = (await PATCH(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("user not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user and send confirmation email", async () => {
      const req = { method: "DELETE" };
      const params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      const res = await DELETE(req as any, { params } as any);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("user deleted");
      expect(sendMail).toHaveBeenCalled();
    });

    it("should return an error if user is not found", async () => {
      const req = { method: "DELETE" };
      const params = { id: "user123" };

      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = (await DELETE(req as any, { params } as any)).json();

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("user not found");
    });

    it("should return an error if user deletion fails", async () => {
      const req = { method: "DELETE" };
      const params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const res = (await DELETE(req as any, { params } as any)).json();

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("user not deleted");
    });

    it("should handle email sending failure gracefully", async () => {
      const req = { method: "DELETE" };
      const params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
      (sendMail as jest.Mock).mockRejectedValue(new Error("Email failed"));

      const res = await DELETE(req as any, { params } as any );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("user deleted");
    });
  });
})

