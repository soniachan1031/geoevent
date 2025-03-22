// jest.setup.ts
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.test" });

export const mockUser = {
  message: "success",
  data: {
    doc: {
      _id: "6799aa60e442831692c7292a",
      name: "ridoy",
      email: "ridoy51306@gmail.com",
      role: "admin",
      disabled: false,
      createdAt: "2025-01-29T04:11:12.336Z",
      updatedAt: "2025-03-18T20:15:37.469Z",
      __v: 0,
      bio: "",
      dateOfBirth: "2025-01-08T00:00:00.000Z",
      phone: 2263398288,
      photo: {
        alt: "ridoy",
        url: "https://geoevent.s3.us-east-2.amazonaws.com/users/6799aa60e442831692c7292a/profile-pic/35c65587-2084-48b2-b936-678e8115d2aa.png",
        _id: "679adff58c9cfe7d0e5719be",
      },
      subscribeToEmails: true,
      id: "6799aa60e442831692c7292a",
    },
  },
};

// 👇 Mock the guard function
jest.mock("@/lib/server/middleware/guard", () => ({
  guard: jest.fn(() => Promise.resolve(mockUser)),
}));

// Mock the jsonwebtoken library globally (outside of any individual test)
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(), // Mock the sign method
}));