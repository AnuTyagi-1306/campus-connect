import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
  type: "task" | "proof" | "insights" | "nudge" | "digest";
  data: string;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.type || typeof body.data !== "string") {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  let prompt = "";
  if (body.type === "task") {
    prompt = `Generate 5 campus ambassador tasks for: ${body.data}.
Return JSON array with objects containing:
title, description, points, proof.
Respond with JSON only.`;
  } else if (body.type === "proof") {
    prompt = `Evaluate this submission: ${body.data}.
Return JSON:
{ "score": number, "feedback": string, "valid": boolean }.
Respond with JSON only.`;
  } else if (body.type === "insights") {
    prompt = `Analyze this data: ${body.data}.
Return JSON:
{
  "insights": ["...", "...", "..."],
  "recommendation": "..."
}
Respond with JSON only.`;
  } else if (body.type === "nudge") {
    prompt = `You are a campus program manager. Write a warm, motivating 2-sentence re-engagement message for an ambassador named ${body.data}.
Be specific, encouraging, and mention their achievement.
Return JSON:
{ "message": string }
Respond with JSON only.`;
  } else if (body.type === "digest") {
    const stats = JSON.parse(body.data);
    prompt = `You are an enthusiastic campus program coach. Write a personalized 3-sentence weekly performance digest for ${stats.name}. They earned ${stats.points} total points, completed ${stats.tasks} tasks this week, their current streak is ${stats.streak} days, they are ranked #${stats.rank}, and they earned these badges: ${stats.badges}. Be specific, energetic, and end with one actionable tip for next week. Sound human, not robotic.
Return JSON:
{ "digest": string }
Respond with JSON only.`;
  } else {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a strict JSON API. Return valid JSON only with no markdown.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = parseJSON(content);
    if (!parsed) {
      return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 502 });
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}
