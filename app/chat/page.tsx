"use client";

import React, { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import {
  Conversation,
  Message,
  ExecutionLog,
  SendMessageResponse,
  ConversationDetail,
} from "@/lib/types";
import ChatInput from "@/components/chat/ChatInput";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import MessageBubble from "@/components/chat/MessageBubble";
import {
  MessageSquare,
  Plus,
  Bot,
  AlertCircle,
  Sparkles,
  History,
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolCallsMap, setToolCallsMap] = useState<Record<string, ExecutionLog[]>>({});
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingConvs, setIsLoadingConvs] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Load user conversations on initial mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoadingConvs(true);
      const data = await apiClient.get<Conversation[]>("/conversations");
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        selectConversation(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setError(null);
    try {
      const detail = await apiClient.get<ConversationDetail>(`/conversations/${convId}`);
      setMessages(detail.messages || []);

      // Group tool calls with their assistant messages if available
      const logs = detail.execution_logs || [];
      const map: Record<string, ExecutionLog[]> = {};
      // If messages exist, attach logs to the last assistant message or map
      const assistantMsgs = (detail.messages || []).filter((m) => m.role === "assistant");
      if (assistantMsgs.length > 0) {
        map[assistantMsgs[assistantMsgs.length - 1].id] = logs;
      }
      setToolCallsMap(map);
    } catch (err: any) {
      console.error("Failed to load conversation details:", err);
      setError("Unable to load message history.");
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setToolCallsMap({});
    setError(null);
  };

  const handleSendMessage = async (prompt: string) => {
    setError(null);
    setIsThinking(true);

    // Optimistically show user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || "temp",
      role: "user",
      content: prompt,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let response: SendMessageResponse;

      if (!activeConversationId) {
        // Create new conversation
        response = await apiClient.post<SendMessageResponse>("/conversations", {
          message: prompt,
        });
        setActiveConversationId(response.conversation_id);
        // Refresh conversations list in sidebar
        loadConversations();
      } else {
        // Send message in existing conversation
        response = await apiClient.post<SendMessageResponse>(
          `/conversations/${activeConversationId}/messages`,
          { message: prompt }
        );
      }

      // Replace optimistic message with actual messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.user_message,
        response.agent_response,
      ]);

      // Record tool calls for this assistant message
      if (response.tool_calls && response.tool_calls.length > 0) {
        setToolCallsMap((prev) => ({
          ...prev,
          [response.agent_response.id]: response.tool_calls,
        }));
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err?.message || "Failed to process message with agent.");
      // Keep optimistic message or indicate error
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["operator", "admin"]}>
      <div className="flex h-screen flex-col bg-slate-50">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Conversation History */}
          <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-white">
            <div className="p-3 border-b border-slate-100">
              <button
                onClick={startNewConversation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Recent Sessions
              </div>

              {isLoadingConvs ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No past conversations yet.</div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-900 font-semibold border border-blue-200/80 shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="truncate flex-1">{conv.title}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Read Tools: Active</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Module 2
              </span>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/60">
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xs px-6 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {activeConversationId
                      ? conversations.find((c) => c.id === activeConversationId)?.title || "Active Session"
                      : "New Session"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Agent reasoning loop with live database read tools
                  </p>
                </div>
              </div>

              <div className="flex md:hidden">
                <button
                  onClick={startNewConversation}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 && !isThinking && (
                <div className="mx-auto max-w-xl my-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md mb-4">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Operations Intelligence Agent
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                    Ask me anything regarding customer accounts, order details, order histories, or account balances.
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => handleSendMessage("Can you find customer Alice and show her details?")}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs"
                    >
                      <strong className="block font-semibold text-slate-900">Customer Lookup</strong>
                      "Can you find customer Alice?"
                    </button>
                    <button
                      onClick={() => handleSendMessage("What is the status of order ord-101?")}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs"
                    >
                      <strong className="block font-semibold text-slate-900">Order Inspection</strong>
                      "What is the status of order ord-101?"
                    </button>
                    <button
                      onClick={() => handleSendMessage("Show me the order history for customer Alice.")}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs"
                    >
                      <strong className="block font-semibold text-slate-900">Order History</strong>
                      "Show me order history for Alice."
                    </button>
                    <button
                      onClick={() => handleSendMessage("Calculate balance and dues for Alice.")}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs"
                    >
                      <strong className="block font-semibold text-slate-900">Balance & Dues</strong>
                      "Calculate balance and dues for Alice."
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  toolCalls={toolCallsMap[msg.id] || []}
                />
              ))}

              {/* Agent Thinking Indicator (FEAT-08) */}
              {isThinking && <ThinkingIndicator />}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar (FEAT-07) */}
            <div className="border-t border-slate-200/80 bg-white p-4">
              <div className="mx-auto max-w-4xl">
                <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
