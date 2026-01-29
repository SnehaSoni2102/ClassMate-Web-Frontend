import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface UpdateTestData {
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  type: "mock" | "live";
  testType: "free" | "paid";
  exam: string;
  durationInMinutes: number;
  totalQuestions: number;
  totalSections: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  languageOptions: string[];
  sections: Array<{
    name: string;
    name_hi: string;
    order: number;
    timeLimit: number;
    questionIds: string[];
    _id?: string;
  }>;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTestData }) => {
      const response = await apiClient.put(`/tests/${id}`, body);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["get-test"] });
    },
  });
}; 