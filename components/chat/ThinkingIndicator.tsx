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
    <div className="flex items-start gap-3 py-3 animate-fade-in">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-2 ring-blue-500/20">
        <Bot className="h-5 w-5 animate-pulse" />
      </div>

      <div className="flex-1 max-w-xl rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Operations Agent is reasoning & running tools{dots}</span>
        </div>
        <p className="mt-1 text-xs text-blue-700/80">
          Analyzing request, evaluating business database tools, and formulating summary ({elapsed}s)
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-200/60 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Sparkles className="h-3 w-3 animate-spin text-blue-600" />
            Gemini Reasoning Loop Active
          </span>
        </div>
      </div>
    </div>
  );
}
