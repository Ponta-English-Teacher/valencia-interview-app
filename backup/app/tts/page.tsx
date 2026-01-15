"use client";

import { useState, useRef, useEffect } from "react";

export default function TTSPage() {
  const [text, setText] = useState(
    "A small fire broke out today.\nNo one was hurt.\nFirefighters stopped it quickly."
  );
  const [voice, setVoice] = useState("en-US-JennyNeural");
  const [speed, setSpeed] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = [
    {
      id: "us-female",
      label: "American Female",
      voice: "en-US-JennyNeural",
      img: "/voices/american-female.png",
    },
    {
      id: "us-male",
      label: "American Male",
      voice: "en-US-GuyNeural",
      img: "/voices/american-male.png",
    },
    {
      id: "uk-female",
      label: "British Female",
      voice: "en-GB-LibbyNeural",
      img: "/voices/british-female.png",
    },
    {
      id: "uk-male",
      label: "British Male",
      voice: "en-GB-RyanNeural",
      img: "/voices/british-male.png",
    },
  ];

  const generateAudio = async () => {
    setLoading(true);

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, speed }),
    });

    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    setAudioUrl(url);
    setLoading(false);
  };

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    audio.play();
  };

  return (
    <main
      style={{
        padding: 40,
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        gap: 40,
      }}
    >
      {/* LEFT: Text Area */}
      <div style={{ flex: 1 }}>
        <h2>News Script</h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            height: "300px",
            padding: 20,
            borderRadius: 12,
            background: "#1e293b",
            color: "white",
            fontSize: "18px",
            lineHeight: "1.6",
            border: "1px solid #334155",
          }}
        />

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={() => setText("")}>Clear</button>
          <button onClick={() => navigator.clipboard.writeText(text)}>
            Copy
          </button>
        </div>
      </div>

      {/* RIGHT: Player + Voices */}
      <div style={{ flex: 1 }}>
        <h2>Select Voice</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {voices.map((v) => (
            <div
              key={v.id}
              onClick={() => setVoice(v.voice)}
              style={{
                border:
                  voice === v.voice
                    ? "3px solid #38bdf8"
                    : "2px solid #475569",
                borderRadius: 12,
                padding: 10,
                cursor: "pointer",
                textAlign: "center",
                background: "#1e293b",
              }}
            >
              <img
                src={v.img}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <div>{v.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 30 }}>Speed</h2>

        <div style={{ display: "flex", gap: 10 }}>
          {[0.75, 1.0, 1.25].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: "8px 16px",
                background: speed === s ? "#38bdf8" : "#475569",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: 30 }}>Player</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={generateAudio}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              background: loading ? "#64748b" : "#38bdf8",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate Audio"}
          </button>

          <button
            onClick={playAudio}
            disabled={!audioUrl}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              background: audioUrl ? "#22c55e" : "#64748b",
              border: "none",
              cursor: "pointer",
            }}
          >
            Play
          </button>
        </div>

        <audio ref={audioRef} src={audioUrl || undefined} />
      </div>
    </main>
  );
}
