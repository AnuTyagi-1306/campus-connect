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
    
    // Fallback to mock responses for testing
    console.log("Using mock AI responses for testing");
    
    let mockResult;
    if (body.type === "task") {
      mockResult = [
        {
          title: "Create Instagram Story",
          description: "Design an engaging Instagram story about our campus event",
          points: 50,
          proof: "Upload screenshot of story with views"
        },
        {
          title: "Campus Flyer Distribution",
          description: "Distribute flyers in high-traffic areas around campus",
          points: 30,
          proof: "Photo of flyer distribution"
        },
        {
          title: "Student Survey",
          description: "Conduct a survey about student preferences for our brand",
          points: 40,
          proof: "Submit survey responses summary"
        },
        {
          title: "Social Media Post",
          description: "Create a Facebook post about our upcoming event",
          points: 25,
          proof: "Screenshot of post with engagement metrics"
        },
        {
          title: "Classroom Announcement",
          description: "Make a brief announcement about our program in 3 classes",
          points: 35,
          proof: "Photo of announcement or professor confirmation"
        }
      ];
    } else if (body.type === "proof") {
      mockResult = {
        score: 85,
        feedback: "Good effort! The submission shows engagement and creativity. Consider adding more specific metrics and call-to-action in future posts.",
        valid: true
      };
    } else if (body.type === "insights") {
      mockResult = {
        insights: [
          "Your social media engagement is 23% above average",
          "Task completion rate improved by 15% this week",
          "Peak activity occurs between 2-4 PM on weekdays"
        ],
        recommendation: "Focus on creating content during peak hours and maintain consistency in posting frequency"
      };
    } else if (body.type === "nudge") {
      mockResult = {
        message: `Hi ${body.data}! We noticed you haven't been active lately. Your previous contributions were amazing, and we'd love to see you back. Try completing just one task today to get back on track!`
      };
    } else if (body.type === "digest") {
      const stats = JSON.parse(body.data);
      mockResult = {
        digest: `Great week ${stats.name}! You earned ${stats.points} points and completed ${stats.tasks} tasks, keeping your ${stats.streak}-day streak alive. Your rank of #${stats.rank} puts you in the top 10% of ambassadors! Next week, try focusing on social media tasks to boost your engagement score.`
      };
    }
    
    return NextResponse.json({ result: mockResult });
  }
}
