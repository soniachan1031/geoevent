import { OPENAI_API_KEY } from "@/lib/credentials";
import AppError from "@/lib/server/AppError";
import AppResponse from "@/lib/server/AppResponse";
import catchAsync from "@/lib/server/catchAsync";
import { guard } from "@/lib/server/middleware/guard";
import { parseJson } from "@/lib/server/reqParser";
import OpenAI from "openai";

// generate event description
// route: api/ai/generate-event-description
export const POST = catchAsync(async (req) => {
  // 1) Ensure the caller is an authenticated user
  await guard(req);

  // 2) Extract query params from the request URL
  //    e.g. /api/ai/generate-event-description?title=Birthday%20Party&details=fun%20games
  const { title: eventTitle, details: eventDetails } = await parseJson(req);

  // 3) Validate inputs
  if (!eventDetails.trim()) throw new AppError(400, "Details cannot be empty.");

  // 4) Build prompts
  const systemPrompt = `You are a helpful assistant that generates short, engaging event descriptions based on user-provided details.`;
  const userPrompt = `Event Title: ${eventTitle}\nAdditional Details: ${eventDetails}`;

  // 5) create openai instance
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  // 6) Call OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  if (!response.choices || response.choices.length === 0)
    throw new AppError(500, "No AI suggestions returned. Try again.");

  const suggestion =
    response.choices[0].message?.content ?? "No suggestion found.";

  return new AppResponse(200, "generated event description", {
    description: suggestion,
  });
});
