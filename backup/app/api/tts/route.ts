import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, voice, speed } = await req.json();

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return new NextResponse("Azure keys not set", { status: 500 });
  }

  const ssml = `
  <speak version="1.0" xml:lang="en-US">
    <voice name="${voice}">
      <prosody rate="${speed}">${text}</prosody>
    </voice>
  </speak>
  `;

  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer);
}