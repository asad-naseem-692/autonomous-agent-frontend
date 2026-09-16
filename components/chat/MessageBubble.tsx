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

  // Simple formatting helper for assistant text: paragraphs, bullet points, bold tags, and inline code
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n");
      const isList = lines.every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim()));

      const formatInline = (text: string) => {
        // Split by code blocks or bold
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-blue-700 border border-slate-200">
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={idx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });
      };

      if (isList) {
        return (
          <ul key={pIdx} className="my-2.5 list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {lines.map((line, lIdx) => {
              const clean = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
              return <li key={lIdx}>{formatInline(clean)}</li>;
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="my-1.5 text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
          {formatInline(para)}
        </p>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="flex max-w-xl items-start gap-2.5 flex-row-reverse">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-tr-xs bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-3 text-xs sm:text-sm text-white shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div className="flex justify-start py-2">
      <div className="flex w-full max-w-3xl items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs shadow-blue-500/20">
          <Bot className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-2.5">
          {/* Tool Result Cards */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="space-y-2 mb-2">
              {toolCalls.map((log) => (
                <ToolResultCard key={log.id} log={log} />
              ))}
            </div>
          )}

          {/* Assistant Final Summary Bubble */}
          <div className="rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            {renderFormattedContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
