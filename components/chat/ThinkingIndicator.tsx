"use client";

import React, { useState, useEffect } from "react";
import { Bot, Sparkles, Loader2 } from "lucide-react";

export default function ThinkingIndicator() {
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    const timer = setInterval(() => {
      setElapsed((sec) => sec + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex items-start gap-3.5 py-3 animate-in fade-in duration-300">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
        <Bot className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
        </span>
      </div>

      <div className="flex-1 max-w-lg rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>AI Operations Engine Reasoning{dots}</span>
          </div>
          <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
            {elapsed}s elapsed
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          Evaluating customer context, orchestrating database tools, and validating safety rules...
        </p>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100/60 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200/60">
            <Sparkles className="h-3 w-3 text-blue-600" />
            Gemini Autonomous Execution Loop
          </span>
        </div>
      </div>
    </div>
  );
}
