export interface KBEntry {
  id: string;
  category: string;
  triggers: string[];
  answer: string;
  followup?: string;
  escalate?: boolean;
}

export interface Conversation {
  id: string;
  client_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}
export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  kb_match_id?: string;
  created_at: string;
}
export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  clientId: string;
  conversationId?: string;
}
export interface ChatResponse {
  conversationId: string;
  isNewConversation: boolean;
}
