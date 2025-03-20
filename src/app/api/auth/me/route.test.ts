import { GET, PATCH, DELETE } from "./route"; // Import API handlers
import User from "@/mongoose/models/User";
import sendMail from "@/lib/server/email/sendMail";
import { uploadImage } from "@/lib/server/s3UploadHandler";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue("mockAuthToken"), // Mock authentication cookie
  }),
}));
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn().mockResolvedValue({
    _id: "user123",
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    dateOfBirth: "2000-01-01",
    bio: "This is a test bio",
    photo: { url: "https://example.com/photo.jpg", alt: "Test User" },
  }),
}));
jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/s3UploadHandler", () => ({
  uploadImage: jest.fn(),
}));

describe("User API", () => {
  it("should return authenticated user details", async () => {
    const req = { method: "GET" };
    const res = await GET(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("success");
    expect(res.body.data.doc.email).toBe("test@example.com");
  });

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

    (uploadImage as jest.Mock).mockResolvedValue(
      "https://example.com/new-photo.jpg"
    );

    const updatedUser = {
      _id: "user123",
      name: "Updated User",
      email: "test@example.com",
      bio: "Updated bio",
      photo: { url: "https://example.com/new-photo.jpg", alt: "Updated User" },
    };

    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

    const res = await PATCH(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("profile updated");
    expect(res.body.data.doc.name).toBe("Updated User");
    expect(res.body.data.doc.photo.url).toBe(
      "https://example.com/new-photo.jpg"
    );
  });

  it("should delete user and send confirmation email", async () => {
    const req = { method: "DELETE" };

    (User.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
    });

    const res = await DELETE(req as any);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user deleted");
    expect(sendMail).toHaveBeenCalled();
  });

  it("should return error if user deletion fails", async () => {
    const req = { method: "DELETE" };

    (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const res = (await DELETE(req as any)).json();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("user not deleted");
  });
});
