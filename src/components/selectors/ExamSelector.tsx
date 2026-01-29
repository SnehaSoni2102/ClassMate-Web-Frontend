import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
  multiple?: boolean;
}

interface ExamData {
  _id: string;
  name: string;
  questionCount?: number;
}

const ExamSelector: React.FC<Props> = ({ value, onChange, multiple = true }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch exams using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["exams", debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get(`/exam/search?name=${encodeURIComponent(debouncedSearch)}&questionCount=true`);
      return response;
    },
    enabled: true, // Always enabled to fetch on initial load
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform data to options
  const options: Option[] = (data?.data as ExamData[] || []).map((exam) => ({
    label: exam.name,
    value: exam._id,
  }));

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
  };

  const handleChange = (newValue: Option[]) => {
    if (!multiple && newValue.length > 1) {
      onChange([newValue[newValue.length - 1]]);
    } else {
      onChange(newValue);
    }
  };

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={multiple ? "Select exams..." : "Select an exam..."}
    />
  );
};

export default ExamSelector;
