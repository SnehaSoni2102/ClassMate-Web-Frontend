import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface UpdateTestStatusData {
  status: string;
}

export const useUpdateTestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testId, status }: { testId: string; status: UpdateTestStatusData }) => {
      const response = await apiClient.patch(`/test/status/${testId}`, status);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["get-test"] });
    },
  });
}; 