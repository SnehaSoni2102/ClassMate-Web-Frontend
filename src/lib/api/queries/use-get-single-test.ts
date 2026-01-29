import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useGetSingleTest = (testId: string) => {
  return useQuery({
    queryKey: ["single-test", testId],
    queryFn: async () => {
      const response = await apiClient.get(`/test/${testId}`);
      return response;
    },
    enabled: !!testId,
  });
};
