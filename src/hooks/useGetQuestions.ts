import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface UseGetQuestionsParams {
  questionType: string;
  searchTerm: string;
  page: number;
  limit?: number;
  examIds?: string[];
  classIds?: string[];
  subjectIds?: string[];
}

interface UseGetQuestionsReturn {
  data: any;
  isLoading: boolean;
  error: string | null;
}

export const useGetQuestions = ({
  questionType,
  searchTerm,
  page,
  limit = 500,
  examIds = [],
  classIds = [],
  subjectIds = []
}: UseGetQuestionsParams): UseGetQuestionsReturn => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          searchTerm: searchTerm,
          page: page.toString(),
          limit: limit.toString(),
          questionType: questionType
        });

        // Only add filter parameters if they have values to avoid unnecessary API calls
        examIds.forEach(id => {
          if (id && id.trim()) {
            params.append('examIds', id.trim());
          }
        });

        classIds.forEach(id => {
          if (id && id.trim()) {
            params.append('classIds', id.trim());
          }
        });

        subjectIds.forEach(id => {
          if (id && id.trim()) {
            params.append('subjectIds', id.trim());
          }
        });

        const response = await apiClient.get(`/question/search?${params.toString()}`);

        if (response.success) {
          setData(response);
        } else {
          setError(response.message || 'Failed to fetch questions');
        }
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Failed to fetch questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [questionType, searchTerm, page, limit, JSON.stringify(examIds), JSON.stringify(classIds), JSON.stringify(subjectIds)]);

  return { data, isLoading, error };
}; 