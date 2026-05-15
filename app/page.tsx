"use client";

import { useState } from "react";

const questions = [
  {
    question: "When is your exam?",
    options: ["Tomorrow", "This week", "Next week", "What exam?"],
  },
  {
    question: "Have you started studying?",
    options: ["Yes", "Kinda", "No", "Spiritually only"],
  },
  {
    question: "Average sleep this week?",
    options: ["8h", "5h", "3h", "Caffeine only"],
  },
  {
    question: "How many lectures did you skip?",
    options: ["1", "2", "All", "I don't remember"],
  },
  {
    question: "Current confidence level?",
    options: [
      "Locked in",
      "Slight panic",
      "Academic victim",
      "It's over",
    ],
  },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  function calculateScore(answers: string[]) {
    let score = 20;

    answers.forEach((a) => {
      if (
        a.includes("Tomorrow") ||
        a.includes("No") ||
        a.includes("Caffeine") ||
        a.includes("victim") ||
        a.includes("over")
      ) {
        score += 20;
      }

      if (
        a.includes("Spiritually") ||
        a.includes("vibes") ||
        a.includes("What exam")
      ) {
        score += 30;
      }
    });

    return Math.min(score, 100);
  }

  function getResult(score: number) {
    if (score < 30) {
      return {
        status: "Surprisingly functional.",
        roast:
          "You might actually survive finals. Suspicious behavior honestly.",
      };
    }

    if (score < 50) {
      return {
        status: "Medium rare.",
        roast:
          "You're stressed, but still academically recognizable.",
      };
    }

    if (score < 70) {
      return {
        status: "Lightly toasted.",
        roast:
          "You're one bad quiz away from a motivational speech montage.",
      };
    }

    if (score < 90) {
      return {
        status: "Deep fried.",
        roast:
          "Your academic strategy currently depends on miracles and caffeine.",
      };
    }

    return {
      status: "Academically finished.",
      roast:
        "You are communicating with your GPA through thoughts and prayers.",
    };
  }

  const handleAnswer = (answer: string) => {
    // Instant death condition
    if (answer === "What exam?") {
      setResult({
        score: 100,
        status: "Academically finished.",
        roast:
          "You discovered the exam at the same time as the exam discovered you.",
      });

      return;
    }

    const updated = [...answers, answer];
    setAnswers(updated);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const score = calculateScore(updated);
      const finalResult = getResult(score);

      setResult({
        score,
        ...finalResult,
      });
    }
  };

  if (result) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-950 via-black to-orange-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-bold mb-4">
          🔥 {result.score}% COOKED
        </h1>

        <p className="text-3xl mb-6">{result.status}</p>

        <div className="bg-zinc-900/70 p-6 rounded-2xl max-w-xl border border-red-500">
          <p className="text-xl">{result.roast}</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl text-xl font-bold transition"
        >
          Retake Test
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-950 via-black to-orange-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold mb-12 text-center">
        How Cooked Are You?
      </h1>

      <div className="max-w-xl w-full">
        <h2 className="text-3xl mb-8 text-center">
          {questions[step].question}
        </h2>

        <div className="grid gap-4">
          {questions[step].options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-xl transition"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}