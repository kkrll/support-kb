import { useQuery } from "@tanstack/react-query";

interface Conversation {
  id: string;
  client_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages: { count: number };
}

export function useConversations(adminPassword: string) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      console.log("🔄 Fetching conversations...");
      const response = await fetch(
        `/api/conversations?admin_password=${encodeURIComponent(adminPassword)}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch");
      }

      const data = await response.json();
      console.log(
        "📋 Conversations received:",
        data.conversations?.length || 0
      );

      return data;
    },
    enabled: !!adminPassword,
  });
}
