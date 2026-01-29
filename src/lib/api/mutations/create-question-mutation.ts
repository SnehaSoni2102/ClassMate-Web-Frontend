import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface CreateQuestionData {
  text: string;
  text_hi: string;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  marks: number;
  negativeMarks: number;
  isTwoOptions: boolean;
  solution: string;
  solution_hi: string;
  image?: string;
  exam?: string;
  subject?: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  groupId?: string;
}

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionData) => {
      const response = await apiClient.post("/question/group-admin", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
};

export const useReportQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, reasons }: { questionId: string; reasons: string[] }) => {
      const response = await apiClient.post("/report-question/add", {
        question: questionId,
        answer: reasons
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}; 