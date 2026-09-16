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
  ApprovalRequest,
} from "@/lib/types";
import ChatInput from "@/components/chat/ChatInput";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import MessageBubble from "@/components/chat/MessageBubble";
import ApprovalCard from "@/components/chat/ApprovalCard";
import ExecutionTraceDrawer from "@/components/chat/ExecutionTraceDrawer";
import {
  MessageSquare,
  Plus,
  Bot,
  AlertCircle,
  Sparkles,
  History,
  Activity,
  Calendar,
  Search,
  Shield,
  UserSearch,
  Package,
  DollarSign,
  X,
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convSearch, setConvSearch] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolCallsMap, setToolCallsMap] = useState<Record<string, ExecutionLog[]>>({});
  const [approvalCardsMap, setApprovalCardsMap] = useState<Record<string, ApprovalRequest>>({});
  const [currentTraceLogs, setCurrentTraceLogs] = useState<ExecutionLog[]>([]);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);
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

      const logs = detail.execution_logs || [];
      setCurrentTraceLogs(logs);

      // Group tool calls with their assistant messages if available
      const map: Record<string, ExecutionLog[]> = {};
      const assistantMsgs = (detail.messages || []).filter((m) => m.role === "assistant");
      if (assistantMsgs.length > 0) {
        map[assistantMsgs[assistantMsgs.length - 1].id] = logs;
      }
      setToolCallsMap(map);

      // Reconstruct approval cards for past write tools
      const pastApprovals: Record<string, ApprovalRequest> = {};
      for (const log of logs) {
        if (
          log.tool_output &&
          typeof log.tool_output === "object" &&
          !Array.isArray(log.tool_output) &&
          (log.tool_output as any).approval_id
        ) {
          const out = log.tool_output as any;
          const targetMsgId = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1].id : log.id;
          pastApprovals[targetMsgId] = {
            id: out.approval_id,
            conversation_id: convId,
            tool_name: log.tool_name,
            tool_input: log.tool_input,
            status: log.status === "pending_approval" ? "pending" : (log.status as any),
            created_at: log.created_at,
            resolved_at: null,
            resolved_by: null,
            message: out.message || out.result || null,
          };
        }
      }
      setApprovalCardsMap(pastApprovals);
    } catch (err: any) {
      console.error("Failed to load conversation details:", err);
      setError("Unable to load message history.");
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setToolCallsMap({});
    setApprovalCardsMap({});
    setCurrentTraceLogs([]);
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

      // Record tool calls for this assistant message and trace drawer
      if (response.tool_calls && response.tool_calls.length > 0) {
        setToolCallsMap((prev) => ({
          ...prev,
          [response.agent_response.id]: response.tool_calls,
        }));

        setCurrentTraceLogs((prev) => [...prev, ...response.tool_calls]);

        // Extract any pending_approval tool outputs and create approval cards
        const newApprovals: Record<string, ApprovalRequest> = {};
        for (const tc of response.tool_calls) {
          if (
            tc.status === "pending_approval" &&
            tc.tool_output &&
            typeof tc.tool_output === "object" &&
            !Array.isArray(tc.tool_output) &&
            (tc.tool_output as any).approval_id
          ) {
            const out = tc.tool_output as any;
            newApprovals[response.agent_response.id] = {
              id: out.approval_id,
              conversation_id: response.conversation_id,
              tool_name: tc.tool_name,
              tool_input: tc.tool_input,
              status: "pending",
              created_at: tc.created_at,
              resolved_at: null,
              resolved_by: null,
              message: null,
            };
          }
        }
        if (Object.keys(newApprovals).length > 0) {
          setApprovalCardsMap((prev) => ({ ...prev, ...newApprovals }));
        }
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err?.message || "Failed to process message with agent.");
    } finally {
      setIsThinking(false);
    }
  };

  const formatSidebarDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const activeTitle = conversations.find((c) => c.id === activeConversationId)?.title || "Active Session";

  return (
    <AuthGuard allowedRoles={["operator", "admin"]}>
      <div className="flex h-screen flex-col bg-slate-50">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Conversation History */}
          <aside className="hidden md:flex w-72 flex-col border-r border-slate-200/80 bg-white">
            <div className="p-3 border-b border-slate-100 space-y-2">
              <button
                onClick={startNewConversation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Session</span>
              </button>

              {/* Search Past Sessions */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter past sessions..."
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                />
                {convSearch && (
                  <button
                    onClick={() => setConvSearch("")}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Recent Sessions
              </div>

              {isLoadingConvs ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No past conversations yet.</div>
              ) : (
                conversations
                  .filter((conv) => conv.title.toLowerCase().includes(convSearch.toLowerCase()))
                  .map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{conv.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatSidebarDate(conv.created_at)}
                          </span>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                Security Guardrails
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/60">
            {/* Thread Header with Execution Trace Button */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xs px-6 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {activeConversationId ? activeTitle : "New Operations Session"}
                  </h2>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Autonomous AI Operations with Zero Pre-Approval Mutation Buffer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Execution Trace Button */}
                <button
                  onClick={() => setIsTraceOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  title="Inspect step-by-step execution timeline"
                >
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Execution Trace</span>
                  <span className="sm:hidden">Trace</span>
                  {currentTraceLogs.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                      {currentTraceLogs.length}
                    </span>
                  )}
                </button>

                <div className="flex md:hidden">
                  <button
                    onClick={startNewConversation}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> New
                  </button>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 && !isThinking && (
                <div className="mx-auto max-w-2xl my-8 text-center animate-in fade-in duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 mb-4">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Operations Intelligence Console
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    AI-driven customer support, order fulfillment, and financial adjustments protected by human-in-the-loop authorization.
                  </p>

                  <div className="mt-8 space-y-4 text-left">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                        Autonomous Read Queries (Instant Execution)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleSendMessage("Can you find customer Alice Smith and show her details?")}
                          className="group flex flex-col items-start rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-2xs hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs mb-1">
                            <UserSearch className="h-3.5 w-3.5" /> Customer Lookup
                          </div>
                          <span className="text-xs text-slate-600 group-hover:text-slate-900">
                            "Find customer Alice Smith and check her balance"
                          </span>
                        </button>

                        <button
                          onClick={() => handleSendMessage("What is the status of order ord-101?")}
                          className="group flex flex-col items-start rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-2xs hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mb-1">
                            <Package className="h-3.5 w-3.5" /> Order Inspection
                          </div>
                          <span className="text-xs text-slate-600 group-hover:text-slate-900">
                            "What is the status of order ord-101?"
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-2 px-1">
                        Sensitive Actions (Requires Human Authorization)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleSendMessage("Apply a $25 credit to customer c002-bob-jones for a delayed shipment.")}
                          className="group flex flex-col items-start rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 text-left shadow-2xs hover:border-amber-400 hover:bg-amber-100/40 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs mb-1">
                            <DollarSign className="h-3.5 w-3.5" /> Apply Store Credit
                          </div>
                          <span className="text-xs text-slate-600 group-hover:text-slate-900">
                            "Apply $25 credit to Bob Jones for delayed shipment"
                          </span>
                        </button>

                        <button
                          onClick={() => handleSendMessage("Cancel order ord-103 for Bob because he changed his mind.")}
                          className="group flex flex-col items-start rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 text-left shadow-2xs hover:border-amber-400 hover:bg-amber-100/40 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs mb-1">
                            <Shield className="h-3.5 w-3.5" /> Cancel Customer Order
                          </div>
                          <span className="text-xs text-slate-600 group-hover:text-slate-900">
                            "Cancel order ord-103 for Bob (changed mind)"
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages + inline ApprovalCards */}
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <MessageBubble
                    message={msg}
                    toolCalls={toolCallsMap[msg.id] || []}
                  />
                  {msg.role === "assistant" && approvalCardsMap[msg.id] && (
                    <div className="ml-10 max-w-xl">
                      <ApprovalCard
                        approval={approvalCardsMap[msg.id]}
                        onResolved={(updated) =>
                          setApprovalCardsMap((prev) => ({
                            ...prev,
                            [msg.id]: updated,
                          }))
                        }
                      />
                    </div>
                  )}
                </React.Fragment>
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

        {/* Execution Trace Slide-over Drawer (FEAT-15) */}
        <ExecutionTraceDrawer
          isOpen={isTraceOpen}
          onClose={() => setIsTraceOpen(false)}
          logs={currentTraceLogs}
          conversationTitle={activeConversationId ? activeTitle : "New Session"}
        />
      </div>
    </AuthGuard>
  );
}
