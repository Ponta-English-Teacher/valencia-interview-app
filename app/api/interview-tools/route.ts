import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. /api/interview-tools will not work.");
}

const openai = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  try {
    const { mode, answer, question } = await req.json();

    if (!mode || !answer) {
      return new Response("Missing mode or answer.", { status: 400 });
    }

    const trimmedAnswer = String(answer).trim();
    const trimmedQuestion = String(question || "").trim();

    const system =
      mode === "correct"
        ? "You are an English teacher preparing students for internship interviews at Disney in Valencia. Correct the student's answer in simple, clear English (B1–B2 level). Keep the meaning the same, improve grammar and clarity, and keep it around the same length. Output only the corrected answer, no explanation."
        : "You are an English teacher preparing students for internship interviews at Disney in Valencia. Rewrite the student's answer in a more natural, confident way in English, but keep the core meaning. Use simple but natural expressions (B2 level, not too difficult). Output only the improved answer, no explanation.";

    const userContent = `Interview question: ${trimmedQuestion || "(unknown question)"}\n\nStudent answer:\n${trimmedAnswer}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      temperature: mode === "natural" ? 0.7 : 0.3,
      max_tokens: 300,
    });

    const out =
      completion.choices[0]?.message?.content?.trim() ||
      "Sorry, I could not generate an answer.";

    return new Response(out, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (e: any) {
    console.error("Error in /api/interview-tools:", e);
    return new Response("Internal error in /api/interview-tools.", {
      status: 500,
    });
  }
}
