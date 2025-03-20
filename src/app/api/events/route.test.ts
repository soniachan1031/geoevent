import { IApiRequest } from "@/types/api.types";
import { GET } from "./route"; // Import the GET handler from your route

it("should return data with status 200", async () => {
  // Mock the Next.js request
  const req = {
    url: "http://localhost/api/events", // Simulating the request URL
    method: "GET",
  };

  // Call the GET handler
  const res = await GET(req as IApiRequest);

  // Assert the response status code and data
  expect(res.status).toBe(200); // Ensure status is 200
});
