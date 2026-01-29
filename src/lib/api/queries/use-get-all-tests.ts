import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useGetAllTests = () => {
  return useQuery({
    queryKey: ["all-tests"],
    queryFn: async () => {
      const response = await apiClient.get("/test/allTests");
      return response;
    },
  });
};
