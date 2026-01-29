import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface CreateTestData {
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
  }>;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTestData) => {
      const response = await apiClient.post("/tests", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["get-test"] });
    },
  });
}; 