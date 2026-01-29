import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
}

interface TopicData {
  _id: string;
  name: string;
  questionCount?: number;
}

const TopicSelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch topics using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["topics", debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get(`/topic/search?name=${encodeURIComponent(debouncedSearch)}&questionCount=true`);
      return response;
    },
    enabled: true, // Always enabled to fetch on initial load
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform data to options
  const options: Option[] = (data?.data as TopicData[] || []).map((topic) => ({
    label: topic.name,
    value: topic._id,
  }));

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
  };

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={onChange}
      placeholder="Select topics..."
      onSearch={handleSearch}
    />
  );
};

export default TopicSelector;
