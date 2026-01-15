"use client";

import { useState, useRef } from "react";

type VoiceOption = {
  id: string;
  label: string;
  voice: string;
  img: string;
};

type InterviewQuestion = {
  id: number;
  text: string;
  hint: string;
  targetSeconds: { min: number; max: number };
  tags: string[];
  modelAnswer: string;
};

type InterviewSet = {
  id: string;
  label: string;
  sequence: number[]; // question IDs in interview order
};

const valenciaQuestions: InterviewQuestion[] = [
  {
    id: 1,
    text: "Tell me about yourself.",
    hint: "Talk about your studies, part-time jobs, hobbies, and personality. / 自己紹介、学業、バイト、趣味、性格を簡単にまとめる。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["self-introduction", "basic"],
    modelAnswer:
      "My name is Yuki, and I am a third-year university student majoring in English. I work part-time at a café, which helps me practice customer service and teamwork. In my free time, I enjoy Disney movies and learning about different cultures. People say I am friendly and calm, and I hope to use these strengths when working with guests.",
  },
  {
    id: 2,
    text: "Why do you want to join the Valencia Disney program?",
    hint: "Explain motivation and goals. / 動機と将来の目標を説明する。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["motivation", "future"],
    modelAnswer:
      "I want to join the Valencia Disney program because I am interested in hospitality and international communication. Disney is known for excellent service, and I want to learn their approach to guest satisfaction. I believe this experience will help me improve my English and prepare for a future career in customer service.",
  },
  {
    id: 3,
    text: "What do you hope to learn from this experience?",
    hint: "Mention skills, culture, teamwork. / 技術・文化理解・チームワークを学びたい理由。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["goals"],
    modelAnswer:
      "I hope to learn how to communicate effectively with people from different backgrounds and how to provide high-quality service in a global environment. I also want to gain confidence in speaking English and understand how Disney trains employees to maintain a positive atmosphere.",
  },
  {
    id: 4,
    text: "Describe a time you worked in a team.",
    hint: "Give a clear example. / 具体的なチーム経験を話す。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["teamwork"],
    modelAnswer:
      "I worked in a team at my part-time café job. During busy hours, we had to coordinate quickly to serve customers. I communicated clearly with coworkers, supported slower staff, and stayed calm. Because of teamwork, we handled the rush smoothly and received positive feedback from customers.",
  },
  {
    id: 5,
    text: "Describe a time you solved a problem or handled a difficult situation.",
    hint: "Explain situation, action, result. / 状況→対応→結果 の順で説明。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["problem-solving"],
    modelAnswer:
      "One time, a customer at the café received the wrong order and became upset. I apologized politely, fixed the order quickly, and offered to replace it. The customer became calm and thanked me for handling the situation carefully. I learned the importance of staying patient and listening.",
  },
  {
    id: 6,
    text: "What are your strengths and weaknesses?",
    hint: "One strength + one weakness + improvement plan. / 長所1つ・短所1つ・改善方法。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["self-awareness"],
    modelAnswer:
      "My strength is patience. I stay calm even when things are busy, and I try to support others. My weakness is that I sometimes hesitate to speak up in groups. I am working on this by practicing discussion in class and trying to express my ideas more confidently.",
  },
  {
    id: 7,
    text: "How do you handle stress or busy situations?",
    hint: "Explain method. / ストレス対処法を具体的に。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["stress"],
    modelAnswer:
      "When I am under stress, I stay organized and focus on tasks one by one. I also communicate with team members to share responsibilities. Taking short breaks when possible helps me reset my mind. I try to stay positive and keep a professional attitude.",
  },
  {
    id: 8,
    text: "Who is your favorite Disney character and why?",
    hint: "Choose one character and explain values. / 1人選んで理由を述べる。",
    targetSeconds: { min: 20, max: 35 },
    tags: ["disney"],
    modelAnswer:
      "My favorite Disney character is Belle because she is curious, kind, and open-minded. She looks beyond appearances and treats everyone with respect. I admire her willingness to understand others, and I want to bring the same attitude when helping guests.",
  },
  {
    id: 9,
    text: "What does Disney hospitality mean to you?",
    hint: "Mention kindness, safety, show, efficiency. / 親切・安全・演出・効率。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["disney-values"],
    modelAnswer:
      "To me, Disney hospitality means creating magical moments with kindness and attention to detail. It also means being aware of safety and making sure every guest feels welcome and comfortable. I think the most important part is treating each guest with respect.",
  },
  {
    id: 10,
    text: "Why should we select you for this program?",
    hint: "Show confidence. / 自信を持って理由を述べる。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["self-promotion"],
    modelAnswer:
      "You should select me because I am motivated, patient, and eager to learn. I enjoy meeting new people and working in teams. I am committed to providing polite and positive service. I believe I can represent your program well and grow through this experience.",
  },
  {
    id: 11,
    text: "How would you handle a guest who is upset or complains?",
    hint: "Listen → apologize → solve. / 聞く→謝る→解決する。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["customer-service"],
    modelAnswer:
      "First, I would listen carefully and let the guest explain the problem without interrupting. Then, I would apologize sincerely and offer a solution, such as replacing an item or calling a supervisor. Staying calm and polite is important so the guest feels respected.",
  },
  {
    id: 12,
    text: "Tell me about a time you demonstrated leadership.",
    hint: "Describe guiding others. / 他の人を導いた経験。",
    targetSeconds: { min: 25, max: 45 },
    tags: ["leadership"],
    modelAnswer:
      "In a university group project, our team was confused about how to start. I suggested dividing tasks and made a simple plan. I checked everyone’s progress and encouraged slower members. Thanks to teamwork and communication, we finished the project successfully.",
  },
  {
    id: 13,
    text: "How do you adapt to different cultures and environments?",
    hint: "Show flexibility. / 柔軟性・文化理解を示す。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["global"],
    modelAnswer:
      "I try to be open-minded and observe how people communicate and behave. I listen carefully and avoid making assumptions. I ask questions politely when I don’t understand something. I believe respecting differences helps create good relationships.",
  },
  {
    id: 14,
    text: "Which Disney value is most important to you: safety, courtesy, show, or efficiency?",
    hint: "Choose one and explain. / 1つ選んで理由を述べる。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["disney-values"],
    modelAnswer:
      "For me, courtesy is the most important value because it is the foundation of good service. When we show kindness and respect, guests feel comfortable and enjoy their experience. Courtesy also helps create a positive workplace atmosphere among team members.",
  },
  {
    id: 15,
    text: "Where do you see yourself in five years?",
    hint: "Show positive future vision. / 前向きな将来像を伝える。",
    targetSeconds: { min: 20, max: 40 },
    tags: ["future"],
    modelAnswer:
      "In five years, I hope to be working in a service or hospitality-related job where I can use the skills I learned abroad. I want to continue improving my English and contribute to a team that values communication and guest satisfaction.",
  },
];

// 4 interview flows (question IDs) mixing categories for a “real” interview feel
const interviewSets: InterviewSet[] = [
  {
    id: "set1",
    label: "Set 1",
    sequence: [1, 2, 3, 4, 5, 9, 10],
  },
  {
    id: "set2",
    label: "Set 2",
    sequence: [1, 6, 7, 11, 9, 15],
  },
  {
    id: "set3",
    label: "Set 3",
    sequence: [1, 4, 12, 3, 13, 14],
  },
  {
    id: "set4",
    label: "Set 4",
    sequence: [1, 2, 8, 9, 11, 15],
  },
];

export default function TTSPage() {
  const [text, setText] = useState(
    "A small fire broke out today.\nNo one was hurt.\nFirefighters stopped it quickly.",
  );
  const [voice, setVoice] = useState("en-US-JennyNeural");
  // UI speed (0.3, 0.5, 0.8, 1.0,1.2)
  const [speed, setSpeed] = useState(0.5);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Current question (index in valenciaQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion: InterviewQuestion =
    valenciaQuestions[currentQuestionIndex];

  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Interview set state
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSetPos, setCurrentSetPos] = useState(0); // position within selected set

  // ==== Whisper STT recording ====
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttError, setSttError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // ==== Answer processing (correction / natural) ====
  const [processingMode, setProcessingMode] = useState<"correct" | "natural" | null>(null);
  const [processedAnswer, setProcessedAnswer] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);

  const voices: VoiceOption[] = [
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

  const setQuestionById = (questionId: number) => {
    const idx = valenciaQuestions.findIndex((q) => q.id === questionId);
    if (idx === -1) return;
    setCurrentQuestionIndex(idx);
    setText(valenciaQuestions[idx].text);
    setShowModelAnswer(false);
  };

  const handleSelectSet = (setIdx: number) => {
    if (setIdx < 0 || setIdx >= interviewSets.length) return;
    const selectedSet = interviewSets[setIdx];
    setCurrentSetIndex(setIdx);
    setCurrentSetPos(0);
    setQuestionById(selectedSet.sequence[0]);
  };

  const handleNextInSet = () => {
    const selectedSet = interviewSets[currentSetIndex];
    if (currentSetPos >= selectedSet.sequence.length - 1) return;
    const newPos = currentSetPos + 1;
    setCurrentSetPos(newPos);
    setQuestionById(selectedSet.sequence[newPos]);
  };

  const handlePrevInSet = () => {
    const selectedSet = interviewSets[currentSetIndex];
    if (currentSetPos <= 0) return;
    const newPos = currentSetPos - 1;
    setCurrentSetPos(newPos);
    setQuestionById(selectedSet.sequence[newPos]);
  };

  const handleSelectQuestion = (index: number) => {
    if (index < 0 || index >= valenciaQuestions.length) return;
    setCurrentQuestionIndex(index);
    setText(valenciaQuestions[index].text);
    setShowModelAnswer(false);
    // We do NOT change currentSetPos here; set flow is optional
  };

  const generateAudio = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend only needs text + voice; speed is handled in the browser
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("TTS error:", msg);
        alert(msg || "TTS error from server.");
        return;
      }

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      console.error("TTS request failed:", err);
      alert("TTS request failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Restart and play at the selected speed
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = speed;
    audio.play();
  };

  // ==== Whisper STT handlers (record → send audio → get transcript) ====
  const startRecording = async () => {
    try {
      setSttError(null);
      setTranscript("");
      setProcessedAnswer("");
      setProcessingError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSttError("Your browser does not support audio recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;

        const blob = new Blob(chunks, { type: "audio/webm" });
        await runWhisperTranscription(blob);
      };

      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      setIsRecording(true);
      recorder.start();
    } catch (e: any) {
      console.error(e);
      setSttError("Could not start recording.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    try {
      recorder.stop();
    } catch (e) {
      console.error(e);
    }
    setIsRecording(false);
  };

  const runWhisperTranscription = async (blob: Blob) => {
    try {
      setIsTranscribing(true);
      setSttError(null);

      const formData = new FormData();
      formData.append("file", blob, "answer.webm");

      const res = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to transcribe audio.");
      }

      const data = await res.json();
      setTranscript(data.text || "");
    } catch (e: any) {
      console.error(e);
      setSttError(e.message || "Whisper STT error.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // ==== Answer processing handlers (correction / natural) ====
  const runAnswerProcessing = async (mode: "correct" | "natural") => {
    if (!transcript.trim()) {
      alert("There is no transcript to process yet.");
      return;
    }
    setProcessingMode(mode);
    setProcessingError(null);
    setProcessedAnswer("");

    try {
      const res = await fetch("/api/interview-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          answer: transcript,
          question: currentQuestion.text,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to process answer.");
      }

      const outText = await res.text();
      setProcessedAnswer(outText.trim());
    } catch (e: any) {
      console.error(e);
      setProcessingError(e.message || "Unknown error.");
    } finally {
      setProcessingMode(null);
    }
  };

  const selectedSet = interviewSets[currentSetIndex];
  const setLength = selectedSet.sequence.length;

  return (
  <main
    style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",    // ← important
      alignItems: "center",
      justifyContent: "flex-start",
      padding: 40,
    }}
  >
      {/* Centered card container */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "#020617",
          borderRadius: 16,
          border: "1px solid #1f2937",
          padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Valencia Interview TTS Practice
        </h1>

        {/* === Valencia Interview Question Selector === */}
        <section
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #1f2937",
            background: "#020617",
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            Interview Question Control
          </h2>

          {/* Interview Set selector */}
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, marginRight: 4 }}>Interview Set:</span>
            {interviewSets.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSet(idx)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border:
                    idx === currentSetIndex
                      ? "2px solid #38bdf8"
                      : "1px solid #4b5563",
                  backgroundColor:
                    idx === currentSetIndex ? "#0f172a" : "#1e293b",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {s.label}
              </button>
            ))}
            <span
              style={{
                fontSize: 12,
                color: "#9ca3af",
                marginLeft: "auto",
              }}
            >
              Question {currentSetPos + 1} / {setLength} in {selectedSet.label}
            </span>
          </div>

          {/* Question index buttons (Q1–Q15) */}
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {valenciaQuestions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(idx)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  border:
                    idx === currentQuestionIndex
                      ? "2px solid #38bdf8"
                      : "1px solid #4b5563",
                  backgroundColor:
                    idx === currentQuestionIndex ? "#0f172a" : "#1e293b",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight:
                    idx === currentQuestionIndex ? "bold" : "normal",
                }}
              >
                Q{q.id}
              </button>
            ))}
          </div>

          {/* Current question display */}
          <div style={{ marginBottom: 4 }}>
            <strong>Question {currentQuestion.id}:</strong>{" "}
            <span>{currentQuestion.text}</span>
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 2 }}>
            <strong>Hint:</strong> {currentQuestion.hint}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
            Recommended length: {currentQuestion.targetSeconds.min}–
            {currentQuestion.targetSeconds.max} seconds
          </div>

          {/* Model answer toggle + send to TTS */}
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setShowModelAnswer((v) => !v)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: showModelAnswer ? "#f97316" : "#4b5563",
                color: "white",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {showModelAnswer ? "Hide model answer" : "Show model answer"}
            </button>

            <button
              type="button"
              onClick={() => setText(currentQuestion.modelAnswer)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#22c55e",
                color: "black",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Send model answer to TTS
            </button>
          </div>

          {showModelAnswer && (
            <div
              style={{
                marginBottom: 10,
                padding: 10,
                borderRadius: 8,
                background: "#0b1120",
                border: "1px solid #1f2937",
                fontSize: 13,
                lineHeight: 1.5,
                color: "#e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Model answer (example):
              </div>
              <div>{currentQuestion.modelAnswer}</div>
            </div>
          )}

          {/* Prev / Next within the selected set */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handlePrevInSet}
              disabled={currentSetPos === 0}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: currentSetPos === 0 ? "#4b5563" : "#475569",
                color: "white",
                cursor: currentSetPos === 0 ? "default" : "pointer",
                fontSize: 13,
              }}
            >
              ◀ Previous
            </button>
            <button
              type="button"
              onClick={handleNextInSet}
              disabled={currentSetPos === setLength - 1}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background:
                  currentSetPos === setLength - 1 ? "#4b5563" : "#38bdf8",
                color: currentSetPos === setLength - 1 ? "white" : "black",
                cursor:
                  currentSetPos === setLength - 1 ? "default" : "pointer",
                fontSize: 13,
              }}
            >
              Next ▶
            </button>
          </div>
        </section>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT SIDE: Script + Your Answer (bigger space) */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
              Interview Script (for TTS)
            </h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: "100%",
                height: "180px",
                padding: 16,
                borderRadius: 12,
                background: "#1e293b",
                color: "white",
                fontSize: "18px",
                lineHeight: "1.6",
                border: "1px solid #334155",
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: 12,
                marginBottom: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={() => setText("")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#475569",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(text)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#38bdf8",
                  color: "black",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>

            {/* === Your Answer section (Whisper STT) === */}
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
              Your Answer (Recording & Transcript)
            </h2>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: isRecording ? "#ef4444" : "#22c55e",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTranscript("");
                  setSttError(null);
                  setProcessedAnswer("");
                  setProcessingError(null);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "#475569",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Clear Answer Text
              </button>

              <button
                type="button"
                onClick={() => setText(transcript)}
                disabled={!transcript.trim()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: transcript.trim() ? "#38bdf8" : "#4b5563",
                  color: transcript.trim() ? "black" : "white",
                  cursor: transcript.trim() ? "pointer" : "default",
                  fontSize: 13,
                }}
              >
                Send transcript to TTS
              </button>
            </div>

            {(isRecording || isTranscribing) && (
              <div
                style={{
                  fontSize: 12,
                  color: "#a5b4fc",
                  marginBottom: 4,
                }}
              >
                {isRecording
                  ? "Recording... Speak your answer."
                  : "Transcribing your answer with Whisper..."}
              </div>
            )}

            {sttError && (
              <div
                style={{
                  fontSize: 12,
                  color: "#f97316",
                  marginBottom: 4,
                }}
              >
                STT error: {sttError}
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken answer will appear here as text."
              style={{
                width: "100%",
                height: "160px",
                padding: 12,
                borderRadius: 8,
                background: "#020617",
                color: "white",
                fontSize: 14,
                lineHeight: 1.5,
                border: "1px solid #334155",
                marginBottom: 10,
              }}
            />

            {/* Correction / Smart rephrase */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => runAnswerProcessing("correct")}
                disabled={!transcript.trim() || processingMode !== null}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    !transcript.trim() || processingMode !== null
                      ? "#4b5563"
                      : "#0ea5e9",
                  color: "black",
                  cursor:
                    !transcript.trim() || processingMode !== null
                      ? "default"
                      : "pointer",
                  fontSize: 13,
                }}
              >
                {processingMode === "correct"
                  ? "Correcting..."
                  : "Correction"}
              </button>

              <button
                type="button"
                onClick={() => runAnswerProcessing("natural")}
                disabled={!transcript.trim() || processingMode !== null}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    !transcript.trim() || processingMode !== null
                      ? "#4b5563"
                      : "#a855f7",
                  color: "white",
                  cursor:
                    !transcript.trim() || processingMode !== null
                      ? "default"
                      : "pointer",
                  fontSize: 13,
                }}
              >
                {processingMode === "natural"
                  ? "Rephrasing..."
                  : "Smart way to say it"}
              </button>

              <button
                type="button"
                onClick={() => setText(processedAnswer)}
                disabled={!processedAnswer.trim()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: processedAnswer.trim() ? "#22c55e" : "#4b5563",
                  color: processedAnswer.trim() ? "black" : "white",
                  cursor: processedAnswer.trim() ? "pointer" : "default",
                  fontSize: 13,
                }}
              >
                Send corrected text to TTS
              </button>
            </div>

            {processingError && (
              <div
                style={{
                  fontSize: 12,
                  color: "#f97316",
                  marginBottom: 4,
                }}
              >
                Error: {processingError}
              </div>
            )}

            {processedAnswer && (
              <div
                style={{
                  marginTop: 4,
                  padding: 10,
                  borderRadius: 8,
                  background: "#020617",
                  border: "1px solid #1f2937",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 4,
                    color: "#e5e7eb",
                  }}
                >
                  Processed answer:
                </div>
                <div>{processedAnswer}</div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Voices + Speed + Player */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Select Voice</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
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
                    padding: "12px 8px",
                    cursor: "pointer",
                    textAlign: "center",
                    background: "#1e293b",
                    transition: "0.15s",
                  }}
                >
                  <img
                    src={v.img}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      margin: "0 auto 6px auto",
                      display: "block",
                    }}
                  />
                  <div style={{ fontSize: 14 }}>{v.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 20, fontSize: 18 }}>Speed</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              {[0.3, 0.5, 0.8, 1.0, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    padding: "8px 16px",
                    background: speed === s ? "#38bdf8" : "#475569",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              0.3x = very slow, 0.5x = slow, 0.8x = near natural, 1.0x = normal
            </div>

            <h2 style={{ marginTop: 20, fontSize: 18 }}>Player</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                onClick={generateAudio}
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: loading ? "#64748b" : "#38bdf8",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {loading ? "Generating..." : "Generate Audio"}
              </button>

              <button
                onClick={playAudio}
                disabled={!audioUrl}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: audioUrl ? "#22c55e" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Play
              </button>
            </div>

            <audio ref={audioRef} src={audioUrl || undefined} />
          </div>
        </div>
      </div>
       <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 14,
          color: "#94a3b8",
          borderTop: "1px solid #334155",
          paddingTop: 12,
          opacity: 0.9,
        }}
      >
        Developed by Prof. Hitoshi Eguchi<br />
        Department of English, Hokusei Gakuen University
      </footer>

    </main>
  );
}

