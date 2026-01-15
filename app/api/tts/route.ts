import { NextRequest, NextResponse } from "next/server";

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "japaneast";

export async function POST(req: NextRequest) {
  try {
    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return new NextResponse("Missing Azure Speech key or region.", {
        status: 500,
      });
    }

    const { text, voice, speed } = await req.json();

    if (!text || !voice) {
      return new NextResponse("Missing text or voice.", { status: 400 });
    }

    // ===== Map UI speed (0.3 / 0.5 / 0.8) -> VERY slow SSML rates =====
    const s = typeof speed === "number" ? speed : 1;

    // Default: slightly slow
    let rate: string = "-20%";

    if (s <= 0.35) {
      // 0.3x → extremely slow
      rate = "-80%";
    } else if (s <= 0.65) {
      // 0.5x → clearly slow
      rate = "-50%";
    } else {
      // 0.8x → a bit slow, close to natural
      rate = "-20%";
    }

    // Escape special characters in text for SSML
    const escapeXml = (str: string) =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const ssml = `<?xml version="1.0" encoding="utf-8"?>
<speak version="1.0" xml:lang="en-US">
  <voice xml:lang="en-US" name="${voice}">
    <prosody rate="${rate}">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>`;

    const ttsUrl = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ttsRes = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      },
      body: ssml,
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      console.error("Azure TTS error:", errText);
      return new NextResponse(errText || "Azure TTS request failed.", {
        status: 500,
      });
    }

    const arrayBuffer = await ttsRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return new NextResponse("Internal TTS error.", { status: 500 });
  }
}