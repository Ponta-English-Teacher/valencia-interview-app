import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. /api/stt will not work.");
}

const openai = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response("No audio file received.", { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-transcribe",
      language: "en",
    });

    return new Response(
      JSON.stringify({ text: transcription.text || "" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  } catch (e: any) {
    console.error("Error in /api/stt:", e);
    return new Response("Internal error in /api/stt.", { status: 500 });
  }
}
