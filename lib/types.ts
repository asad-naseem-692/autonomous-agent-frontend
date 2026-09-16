export type UserRole = "operator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface ApiError {
  detail: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ExecutionLog {
  id: string;
  conversation_id: string;
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: Record<string, any> | any[] | null;
  status: "executed" | "pending_approval" | "rejected" | "failed";
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface SendMessageResponse {
  conversation_id: string;
  user_message: Message;
  agent_response: Message;
  tool_calls: ExecutionLog[];
}

export interface ConversationDetail {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  messages: Message[];
  execution_logs: ExecutionLog[];
}

export interface ApprovalRequest {
  id: string;
  conversation_id: string;
  tool_name: string;
  tool_input: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  message: string | null;
}

export interface AdminExecutionLog extends ExecutionLog {
  user_id?: string;
  user_name?: string;
  user_email?: string;
  conversation_title?: string;
}
