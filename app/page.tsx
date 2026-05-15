"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Result {
  score: number;
  status: string;
  roast: string;
  emoji: string;
  tier: "safe" | "mid" | "toasted" | "fried" | "gone";
}

/* ─────────────────────────────────────────────
   QUESTIONS
───────────────────────────────────────────── */
const questions = [
  {
    q: "When is your exam?",
    options: [
      { label: "Next month lol 😌", weight: 0 },
      { label: "Next week", weight: 10 },
      { label: "Tomorrow", weight: 30 },
      { label: "What exam? 👁️", weight: 999 }, // easter egg
    ],
  },
  {
    q: "Have you started studying?",
    options: [
      { label: "Yes, daily 📚", weight: 0 },
      { label: "Kinda. I opened the tab.", weight: 15 },
      { label: "No but I plan to", weight: 25 },
      { label: "Spiritually only 🙏", weight: 35 },
    ],
  },
  {
    q: "Average sleep this week?",
    options: [
      { label: "8h, I'm built different", weight: 0 },
      { label: "6h, fine enough", weight: 10 },
      { label: "3h and energy drinks", weight: 25 },
      { label: "Sleep is for the passed 💀", weight: 35 },
    ],
  },
  {
    q: "How many lectures did you skip?",
    options: [
      { label: "Zero. Attendance is sacred.", weight: 0 },
      { label: "A couple, won't lie", weight: 15 },
      { label: "Most of them", weight: 25 },
      { label: "I pay tuition for the vibes", weight: 35 },
    ],
  },
  {
    q: "Current confidence level?",
    options: [
      { label: "Locked in 💪", weight: 0 },
      { label: "Slightly panicked", weight: 15 },
      { label: "Academic victim", weight: 25 },
      { label: "It's over for me 😭", weight: 35 },
    ],
  },
];

/* ─────────────────────────────────────────────
   SCORING
───────────────────────────────────────────── */
function buildResult(score: number): Result {
  if (score < 20)
    return {
      score,
      tier: "safe",
      status: "Suspiciously fine.",
      roast:
        "You're either actually prepared or delusional. Either way, respect.",
      emoji: "😎",
    };
  if (score < 45)
    return {
      score,
      tier: "mid",
      status: "Medium rare.",
      roast: "You're stressed but academically still recognizable.",
      emoji: "😬",
    };
  if (score < 65)
    return {
      score,
      tier: "toasted",
      status: "Lightly toasted.",
      roast: "One bad quiz away from failing this class.",
      emoji: "🥴",
    };
  if (score < 85)
    return {
      score,
      tier: "fried",
      status: "Deep fried.",
      roast: "Your strategy currently relies on miracles and caffeine.",
      emoji: "🔥",
    };
  return {
    score,
    tier: "gone",
    status: "Academically deceased.",
    roast: "GGWP, see you next semester.",
    emoji: "💀",
  };
}

/* ─────────────────────────────────────────────
   TIER → VISUAL CONFIG
───────────────────────────────────────────── */
const tierConfig = {
  safe: {
    bg: "from-emerald-950 via-black to-teal-950",
    accent: "#10b981",
    glow: "shadow-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  mid: {
    bg: "from-yellow-950 via-black to-orange-950",
    accent: "#f59e0b",
    glow: "shadow-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  toasted: {
    bg: "from-orange-950 via-black to-red-950",
    accent: "#f97316",
    glow: "shadow-orange-500/30",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  fried: {
    bg: "from-red-950 via-black to-orange-950",
    accent: "#ef4444",
    glow: "shadow-red-500/40",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
  },
  gone: {
    bg: "from-red-950 via-zinc-950 to-red-950",
    accent: "#dc2626",
    glow: "shadow-red-600/50",
    badge: "bg-red-600/30 text-red-200 border-red-600/50",
  },
};

/* ─────────────────────────────────────────────
   SPEEDOMETER
───────────────────────────────────────────── */
function Speedometer({
  value,
  accent,
  animate,
}: {
  value: number;
  accent: string;
  animate: boolean;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const step = () => {
      start += 1.8;
      if (start >= value) {
        setDisplayed(value);
        return;
      }
      setDisplayed(Math.round(start));
      requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(t);
  }, [value, animate]);

  const angle = (displayed / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 220 130" width="220" height="130" aria-hidden="true">
        {/* track */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="#27272a"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* colored fill up to value */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={283 - (displayed / 100) * 283}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        {/* tick marks */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const a = ((pct / 100) * 180 - 90) * (Math.PI / 180);
          const x1 = 110 + 72 * Math.cos(a);
          const y1 = 110 + 72 * Math.sin(a);
          const x2 = 110 + 82 * Math.cos(a);
          const y2 = 110 + 82 * Math.sin(a);
          return (
            <line
              key={pct}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#52525b"
              strokeWidth="2"
            />
          );
        })}
        {/* needle */}
        <g
          transform={`rotate(${angle}, 110, 110)`}
          style={{ transition: "transform 0.05s linear" }}
        >
          <line
            x1="110"
            y1="110"
            x2="110"
            y2="32"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="110"
            y1="110"
            x2="110"
            y2="118"
            stroke="#71717a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        {/* center pin */}
        <circle cx="110" cy="110" r="7" fill="white" />
        <circle cx="110" cy="110" r="3.5" fill="#09090b" />
        {/* gradient def */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        {/* labels */}
        <text x="16" y="126" fill="#52525b" fontSize="10" textAnchor="middle">
          0
        </text>
        <text x="204" y="126" fill="#52525b" fontSize="10" textAnchor="middle">
          100
        </text>
      </svg>
      {/* number */}
      <div
        className="text-7xl font-black tabular-nums mt-1 leading-none"
        style={{ color: accent }}
      >
        {displayed}
        <span className="text-3xl">%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARE CARD (hidden, rendered to canvas)
───────────────────────────────────────────── */
function ShareCard({
  result,
  cardRef,
}: {
  result: Result;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cfg = tierConfig[result.tier];
  // Use inline gradient style since this element is hidden off-screen
  const gradMap: Record<string, string> = {
    safe: "linear-gradient(135deg, #022c22 0%, #000 50%, #042f2e 100%)",
    mid: "linear-gradient(135deg, #451a03 0%, #000 50%, #431407 100%)",
    toasted: "linear-gradient(135deg, #431407 0%, #000 50%, #450a0a 100%)",
    fried: "linear-gradient(135deg, #450a0a 0%, #000 50%, #431407 100%)",
    gone: "linear-gradient(135deg, #450a0a 0%, #18181b 50%, #450a0a 100%)",
  };

  return (
    <div
      ref={cardRef}
      style={{
        width: "400px",
        height: "711px", // 9:16 story ratio
        background: gradMap[result.tier],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "40px 32px",
        boxSizing: "border-box",
      }}
    >
      {/* top label */}
      <p
        style={{
          color: "#71717a",
          fontSize: "14px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        howcookedami.com
      </p>

      {/* big emoji */}
      <div style={{ fontSize: "80px", marginBottom: "16px" }}>
        {result.emoji}
      </div>

      {/* score */}
      <div
        style={{
          fontSize: "100px",
          fontWeight: 900,
          color: cfg.accent,
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {result.score}%
      </div>
      <div
        style={{
          color: "white",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        COOKED
      </div>

      {/* divider */}
      <div
        style={{
          width: "60px",
          height: "2px",
          background: cfg.accent,
          margin: "20px 0",
          borderRadius: "2px",
        }}
      />

      {/* roast */}
      <div
        style={{
          color: "#a1a1aa",
          fontSize: "15px",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "300px",
          marginBottom: "40px",
        }}
      >
        {result.roast}
      </div>

      {/* CTA */}
      <div
        style={{
          border: `1px solid ${cfg.accent}`,
          borderRadius: "12px",
          padding: "12px 28px",
          color: cfg.accent,
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        Take the quiz →
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GLITCH EASTER EGG SCREEN
───────────────────────────────────────────── */
function GlitchScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<
    "idle" | "error" | "scanning" | "reveal"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [glitchText, setGlitchText] = useState("SYSTEM INITIALIZING");

  const glitchStrings = [
    "ACCESSING ACADEMIC RECORDS...",
    "ERR0R: LECTURE ATTENDANCE = NULL",
    "SYLLABUS LAST OPENED: NEVER",
    "WARNING: EXAM DATE DETECTED",
    "GPA CRITICAL — EMERGENCY PROTOCOL",
    "DEPLOYING PRAYER.EXE",
    "CALCULATING DOOM PROBABILITY...",
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("error"), 600);
    const t2 = setTimeout(() => setPhase("scanning"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;
    let idx = 0;
    const interval = setInterval(() => {
      setGlitchText(glitchStrings[idx % glitchStrings.length]);
      setProgress((p) => Math.min(p + 14, 98));
      idx++;
      if (idx >= glitchStrings.length) {
        clearInterval(interval);
        setTimeout(() => {
          setProgress(100);
          setPhase("reveal");
          setTimeout(onDone, 900);
        }, 400);
      }
    }, 320);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
          animation: "scanlines 0.1s linear infinite",
        }}
      />

      {phase === "idle" && (
        <div className="text-green-400 font-mono text-lg animate-pulse">
          LOADING SYSTEM...
        </div>
      )}

      {phase === "error" && (
        <div
          className="text-center px-8 animate-pulse"
          style={{ animation: "shake 0.1s ease infinite" }}
        >
          <div className="text-red-500 font-mono text-6xl font-black mb-4">
            ⚠️
          </div>
          <div className="text-red-400 font-mono text-2xl font-bold mb-2">
            CRITICAL ERROR
          </div>
          <div className="text-red-300 font-mono text-sm opacity-80">
            ACADEMIC INTELLIGENCE DATABASE FAILURE
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-4">
            ERROR CODE: EXAM_NOT_FOUND_0xDEAD
          </div>
        </div>
      )}

      {phase === "scanning" && (
        <div className="w-full max-w-xs px-8 text-center">
          <div className="text-green-400 font-mono text-xs mb-6 min-h-[48px] leading-relaxed">
            {glitchText}
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-green-600 font-mono text-xs">
            {progress}% — DO NOT CLOSE
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div className="text-center text-white font-mono text-2xl font-black animate-bounce">
          💀 FOUND YOU 💀
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) skewX(-1deg); }
          75% { transform: translateX(3px) skewX(1deg); }
        }
        @keyframes scanlines {
          from { background-position: 0 0; }
          to { background-position: 0 4px; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESULT SCREEN
───────────────────────────────────────────── */
function ResultScreen({ result }: { result: Result }) {
  const cfg = tierConfig[result.tier];
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);

  const isHighScore = result.score >= 80;

  useEffect(() => {
    if (isHighScore) {
      const interval = setInterval(
        () => setShakeActive((s) => !s),
        2000
      );
      return () => clearInterval(interval);
    }
  }, [isHighScore]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "how-cooked-am-i.png", {
            type: "image/png",
          });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `I am ${result.score}% cooked`,
              text: `${result.status} ${result.roast} — How cooked are you?`,
            });
          } else {
            // fallback: download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "how-cooked-am-i.png";
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    } catch {
      // fallback: copy text
      await navigator.clipboard.writeText(
        `I am ${result.score}% cooked. "${result.roast}" — find out how cooked YOU are 👇`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setSharing(false);
    }
  }, [result]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${cfg.bg} text-white flex flex-col items-center justify-start pt-10 pb-16 px-5 relative overflow-hidden`}
    >
      {/* background glow pulse for high scores */}
      {isHighScore && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${shakeActive ? "opacity-20" : "opacity-5"}`}
          style={{ background: `radial-gradient(circle, ${cfg.accent} 0%, transparent 70%)` }}
        />
      )}

      {/* hidden share card — zero-size wrapper keeps it out of layout flow */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", top: 0, left: 0 }}
      >
        <ShareCard result={result} cardRef={cardRef} />
      </div>

      {/* header */}
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6">
        How Cooked Am I?
      </p>

      {/* speedometer */}
      <div
        className={`transition-all duration-300 ${isHighScore && shakeActive ? "scale-105" : "scale-100"}`}
      >
        <Speedometer value={result.score} accent={cfg.accent} animate />
      </div>

      {/* cooked label */}
      <div
        className={`mt-3 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${cfg.badge}`}
      >
        {result.emoji} {result.status}
      </div>

      {/* roast card */}
      <div
        className={`mt-4 w-full max-w-sm rounded-2xl border p-5 text-center ${cfg.badge} backdrop-blur-sm`}
        style={{ background: `${cfg.accent}10`, borderColor: `${cfg.accent}40` }}
      >
        <p className="text-base text-white/90 leading-relaxed">{result.roast}</p>
      </div>

      {/* share button */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="mt-6 w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-95"
        style={{ background: cfg.accent, opacity: sharing ? 0.7 : 1 }}
      >
        {sharing
          ? "Generating card..."
          : copied
          ? "✅ Copied to clipboard!"
          : "📲 Share My Result"}
      </button>

      <p className="mt-2 text-zinc-600 text-xs text-center max-w-xs">
        Saves as a 9:16 story card — perfect for Instagram &amp; TikTok
      </p>

      {/* retake */}
      <button
        onClick={() => window.location.reload()}
        className="mt-5 text-zinc-500 text-sm underline underline-offset-4 hover:text-white transition"
      >
        Try again (it won't help)
      </button>
    </main>
  );
}

/* ─────────────────────────────────────────────
   QUIZ SCREEN
───────────────────────────────────────────── */
function QuizScreen() {
  const [step, setStep] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<{
    weight: number;
    isEasterEgg: boolean;
    updatedWeight: number;
  } | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  const current = questions[step];
  const progress = ((step) / questions.length) * 100;

  const handleAnswer = (weight: number, label: string) => {
    const isEasterEgg = label.includes("What exam");
    const updatedWeight = totalWeight + weight;

    setFadeOut(true);

    setTimeout(() => {
      if (isEasterEgg) {
        setShowGlitch(true);
        setPendingAnswer({ weight, isEasterEgg: true, updatedWeight: 100 });
        setFadeOut(false);
        return;
      }

      const newWeight = updatedWeight;
      setTotalWeight(newWeight);

      if (step < questions.length - 1) {
        setStep((s) => s + 1);
        setFadeOut(false);
      } else {
        // final answer — compute result
        const score = Math.min(Math.round((newWeight / 140) * 100), 100);
        setResult(buildResult(score));
      }
    }, 250);
  };

  const onGlitchDone = () => {
    setShowGlitch(false);
    setResult(
      buildResult(100)
    );
  };

  if (showGlitch) return <GlitchScreen onDone={onGlitchDone} />;
  if (result) return <ResultScreen result={result} />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white flex flex-col items-center justify-between px-5 py-10">
      {/* header */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            How Cooked Am I?
          </p>
          <p className="text-zinc-500 text-xs">
            {step + 1}/{questions.length}
          </p>
        </div>
        {/* progress bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-8 overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* question */}
      <div
        className={`flex-1 flex flex-col items-center justify-center w-full max-w-sm transition-all duration-250 ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
      >
        <h2 className="text-2xl font-black text-center mb-8 leading-snug">
          {current.q}
        </h2>

        <div className="w-full flex flex-col gap-3">
          {current.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.weight, opt.label)}
              className="w-full py-4 px-5 rounded-2xl text-left text-base font-semibold bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 active:scale-98 transition-all duration-150"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* spacer */}
      <div className="h-12" />

      <style>{`
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </main>
  );
}

/* ─────────────────────────────────────────────
   LANDING SCREEN
───────────────────────────────────────────── */
function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-red-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🔥</div>
      <h1 className="text-4xl font-black mb-2 leading-tight">
        How Cooked
        <br />
        Are You?
      </h1>
      <p className="text-zinc-400 text-base mb-10 max-w-xs">
        5 questions. Brutal honesty. Find out your academic doom score.
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-xs py-5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 font-black text-xl transition-all duration-150"
      >
        Start Quiz 🔥
      </button>
      <p className="mt-5 text-zinc-600 text-xs">
        Warning: results may cause emotional damage
      </p>
    </main>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function Home() {
  const [started, setStarted] = useState(false);

  if (!started) return <LandingScreen onStart={() => setStarted(true)} />;
  return <QuizScreen />;
}
