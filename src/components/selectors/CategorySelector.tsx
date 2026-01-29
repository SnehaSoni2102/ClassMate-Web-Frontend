import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface CategoryData {
  _id: string;
  name: string;
  logo?: string;
}

const CategorySelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["categories", debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get(`/category/search?name=${encodeURIComponent(debouncedSearch)}`);
      return response;
    },
    enabled: true, // Always enabled to fetch on initial load
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform data to categories
  const categories = (data?.data as CategoryData[] || []);

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 pb-2">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8"
          />
        </div>
        {isLoading ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">No categories found</div>
        ) : (
          categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              <div className="flex items-center gap-2">
                {category.logo && (
                  <img
                    src={category.logo}
                    alt={category.name}
                    className="h-4 w-4 object-contain"
                  />
                )}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector; 