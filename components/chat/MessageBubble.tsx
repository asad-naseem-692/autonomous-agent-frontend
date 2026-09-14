"use client";

import React from "react";
import { User as UserIcon, Bot } from "lucide-react";
import { Message, ExecutionLog } from "@/lib/types";
import ToolResultCard from "./ToolResultCard";

interface MessageBubbleProps {
  message: Message;
  toolCalls?: ExecutionLog[];
}

export default function MessageBubble({ message, toolCalls = [] }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Simple formatting helper for assistant text: paragraphs, bullet points, bold tags
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n");
      const isList = lines.every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim()));

      if (isList) {
        return (
          <ul key={pIdx} className="my-2 list-disc pl-5 space-y-1 text-sm text-slate-800">
            {lines.map((line, lIdx) => {
              const clean = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
              return <li key={lIdx}>{clean}</li>;
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="my-1 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
          {para}
        </p>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="flex max-w-xl items-start gap-2.5 flex-row-reverse">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-tr-xs bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xs">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div className="flex justify-start py-2">
      <div className="flex w-full max-w-3xl items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
          <Bot className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-2">
          {/* Tool Result Cards (FEAT-09) */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {toolCalls.map((log) => (
                <ToolResultCard key={log.id} log={log} />
              ))}
            </div>
          )}

          {/* Assistant Final Summary Bubble (FEAT-10) */}
          <div className="rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white p-4 shadow-xs">
            {renderFormattedContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
