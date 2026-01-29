import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
}

interface SubjectData {
  _id: string;
  name: string;
  questionCount?: number;
}

const SubjectSelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch subjects using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["subjects", debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get(`/subject/search?name=${encodeURIComponent(debouncedSearch)}&questionCount=true`);
      return response;
    },
    enabled: true, // Always enabled to fetch on initial load
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform data to options
  const options: Option[] = (data?.data as SubjectData[] || []).map((subject) => ({
    label: subject.name,
    value: subject._id,
  }));

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
  };

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={onChange}
      placeholder="Select subjects..."
      onSearch={handleSearch}
    />
  );
};

export default SubjectSelector;
