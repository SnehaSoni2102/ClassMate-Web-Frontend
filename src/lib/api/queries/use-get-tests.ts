import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface GetTestsParams {
  searchTerm?: string;
  page?: number;
  type?: "all" | "mock" | "live";
}

export const useGetTests = (params: GetTestsParams = {}) => {
  return useQuery({
    queryKey: ["tests", params],
    queryFn: async () => {
      const response = await apiClient.get("/tests", params);
      return response;
    },
  });
}; 