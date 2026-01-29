import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useGetTest = (id: string) => {
  return useQuery({
    queryKey: ["get-test", id],
    queryFn: async () => {
      const response = await apiClient.get(`/group/fetch-test/${id}`);
      return response;
    },
    enabled: !!id,
  });
}; 