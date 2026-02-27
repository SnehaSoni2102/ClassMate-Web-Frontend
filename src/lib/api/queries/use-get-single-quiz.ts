import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useGetSingleQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ["single-quiz", quizId],
    queryFn: async () => {
      const response = await apiClient.get(`/quiz/${quizId}`);
      return response;
    },
    enabled: !!quizId,
  });
};

