import { POST } from "./route";
import User from "@/mongoose/models/User";
import { parseJson } from "@/lib/server/reqParser";

jest.mock("@/mongoose/models/User");
jest.mock("@/lib/server/email/sendMail", () => jest.fn());
jest.mock("@/lib/server/cookieHandler", () => ({
  setAuthCookie: jest.fn(),
}));
jest.mock("@/lib/server/connectDB", () => jest.fn());
jest.mock("@/lib/server/email/templates/registrationSuccessTemplate", () =>
  jest.fn(() => "<html>welcome</html>")
);
jest.mock("@/lib/server/reqParser", () => ({
  parseJson: jest.fn(),
}));

const mockReq = new Request("http://localhost/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Nzube",
    email: "nzube@example.com",

    password: "secure123",
    confirmPassword: "secure123",
  }),
});

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseUserInput = {
    name: "Nzube",
    email: "nzube@example.com",
    password: "secure123",
    confirmPassword: "secure123",
  };

  it("should register a user successfully", async () => {
    (parseJson as jest.Mock).mockResolvedValue(baseUserInput);
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    (User.create as jest.Mock).mockResolvedValue({
      _id: "user123",
      ...baseUserInput,
    });

    const res = await POST(mockReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("registration successful");
  });

  it("should return 400 if name is missing", async () => {
    (parseJson as jest.Mock).mockResolvedValue({
      ...baseUserInput,
      name: "",
    });

    const res = await POST(mockReq);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("name is required");
  });

  it("should return 400 if email is invalid", async () => {
    (parseJson as jest.Mock).mockResolvedValue({
      ...baseUserInput,
      email: "invalid-email",
    });

    const res = await POST(mockReq);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("not a valid email");
  });

  it("should return 400 if password and confirmPassword don't match", async () => {
    (parseJson as jest.Mock).mockResolvedValue({
      ...baseUserInput,
      confirmPassword: "wrongpass",
    });

    const res = await POST(mockReq);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("passwords don't match");
  });
});
