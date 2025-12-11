import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  kb_match_id?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  client_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export function useConversation(id: string, adminPassword: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const response = await fetch(
        `/api/conversations/${id}?admin_password=${encodeURIComponent(
          adminPassword
        )}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch conversation");
      }

      return response.json() as Promise<{
        conversation: Conversation;
        messages: Message[];
      }>;
    },
    enabled: !!id && !!adminPassword, // Only run if we have both id and password
    retry: 1,
  });
}
