import { POST } from "./route"; // Import the POST handler from your route

// Mock cookies to prevent the error during testing
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null), // Return a mock for the 'get' method of cookies
  }),
}));

it("should generate event description with status 200", async () => {
  // Mock the Next.js request
  const req = {
    url: "http://localhost/api/ai/generate-event-description", // Simulating the request URL
    method: "POST",
    body: {
      title: "Birthday Party",
      details: "fun games",
    }, // Simulating the request body
  };

  // Call the POST handler
  const res = await POST(req as any);

  // Assert the response status code and data
  expect(res.status).toBe(200); // Ensure status is 200
  expect(res.body.message).toBe("generated event description"); // Ensure the success message is correct
});

it("should return an error when details are empty", async () => {
  // Mock the Next.js request with empty details
  const req = {
    url: "http://localhost/api/ai/generate-event-description", // Simulating the request URL
    method: "POST",
    body: {
      title: "Birthday Party",
      details: "", // Empty details should trigger validation error
    },
  };

  // Call the POST handler
  const res = (await POST(req as any)).json();

  // Assert the error response
  expect(res.status).toBe(400); // Ensure status is 400 for validation error
  expect(res.body.message).toBe("Details cannot be empty."); // Ensure the error message is correct
});
