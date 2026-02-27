import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { CreateGroupQuizPayload } from "@/types/quiz";

type UpdateQuizData = Partial<CreateGroupQuizPayload>;

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateQuizData }) => {
      const response = await apiClient.patch(`/quiz/${id}`, body);
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["single-quiz", variables.id] });
    },
  });
};

