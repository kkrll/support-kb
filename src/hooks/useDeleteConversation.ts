import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      adminPassword,
    }: {
      id: string;
      adminPassword: string;
    }) => {
      const response = await fetch(
        `/api/conversations?id=${id}&admin_password=${encodeURIComponent(
          adminPassword
        )}`,        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete conversation");
      }

      return response.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to delete conversation:", error);
    },
  });
}
