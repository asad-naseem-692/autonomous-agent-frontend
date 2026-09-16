"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask about a customer, order status, or account balance...",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="space-y-1.5">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-slate-300/90 bg-white p-2.5 shadow-sm shadow-slate-200/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "AI Agent is executing and reasoning..." : placeholder}
          className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:opacity-50 max-h-40 leading-relaxed font-sans"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all cursor-pointer"
          title="Send message (Enter)"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
        <span>Type an instruction or customer inquiry to get started</span>
        <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500">
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200 text-slate-600 font-semibold">Enter ↵</kbd> send &middot; <kbd className="rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200 text-slate-600 font-semibold">Shift + Enter</kbd> new line
        </span>
      </div>
    </div>
  );
}
