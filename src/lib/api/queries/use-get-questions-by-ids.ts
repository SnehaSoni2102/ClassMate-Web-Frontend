import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useGetQuestionsByIds = (questionIds: string[]) => {
  return useQuery({
    queryKey: ["questions-by-ids", questionIds],
    queryFn: async () => {
      if (questionIds.length === 0) {
        return { data: [] };
      }
      const response = await apiClient.post("/question/get-by-ids", { questionIds });
      return response;
    },
    enabled: questionIds.length > 0,
  });
}; 