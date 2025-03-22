import { GET, PATCH, DELETE } from "./route";
import User from "@/mongoose/models/User";
import { guard } from "@/lib/server/middleware/guard";
import sendMail from "@/lib/server/email/sendMail";

jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/middleware/guard", () => ({ guard: jest.fn() }));
jest.mock("@/lib/server/s3UploadHandler", () => ({ uploadImage: jest.fn() }));
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/connectDB", () => jest.fn());

const createParams = (id: string) => Promise.resolve({ id });
const mockReq = {} as Request;

describe("GET /api/users/:id", () => {
  it("should return user if found", async () => {
    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue({
      _id: "user123",
      name: "John",
    });

    const res = await GET(mockReq, { params: createParams("user123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("user retrieved");
  });

  it("should return 404 if user not found", async () => {
    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(null);

    const res = await GET(mockReq, { params: createParams("missing") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("user not found");
  });
});

describe("PATCH /api/users/:id", () => {
  it("should update and return user", async () => {
    const mockUser = { _id: "user123", name: "Old Name" };
    const mockUpdatedUser = { _id: "user123", name: "New Name" };

    const formData = new FormData();
    formData.append("data", JSON.stringify({ name: "New Name" }));

    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const req = new Request("http://localhost/api/users/user123", {
      method: "PATCH",
      body: formData,
    });

    const res = await PATCH(req, { params: createParams("user123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("profile updated");
  });

  it("should return 404 if user not found", async () => {
    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/users/user123", {
      method: "PATCH",
      body: new FormData(),
    });

    const res = await PATCH(req, { params: createParams("user123") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("user not found");
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete user and send email", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      name: "User",
    };

    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
    (sendMail as jest.Mock).mockResolvedValue(true);

    const res = await DELETE(mockReq, { params: createParams("user123") });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("user deleted");
  });

  it("should return 404 if user not found", async () => {
    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(mockReq, { params: createParams("notfound") });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe("user not found");
  });

  it("should return 500 if user not deleted", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };

    (guard as jest.Mock).mockResolvedValue({});
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(mockReq, { params: createParams("user123") });

    expect(res.status).toBe(500);
  });
});
