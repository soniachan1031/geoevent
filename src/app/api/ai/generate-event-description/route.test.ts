import { POST } from "./route"; // Import the POST handler from your route

it("should generate event description with status 200", async () => {
  const req = new Request(
    "http://localhost/api/ai/generate-event-description",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Birthday Party",
        details: "fun games",
      }),
    }
  );

  const res = await POST(req);

  expect(res.status).toBe(200);
});

it("should return an error when details are empty", async () => {
  // Mock the Next.js request with empty details
  const req = new Request(
    "http://localhost/api/ai/generate-event-description",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Birthday Party",
        details: "", // Empty details
      }),
    }
  );

  // Call the POST handler
  const res = await POST(req as any);

  const response = await res.json(); // Parse the response

  // Assert the error response
  expect(res.status).toBe(400); // Ensure status is 400 for validation error
  expect(response.message).toBe("Details cannot be empty."); // Ensure the error message is correct
});
