import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  FileText,
  Award,
  Target,
  Users,
  Globe,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGetSingleQuiz } from "@/lib/api/queries/use-get-single-quiz";

interface QuizData {
  _id: string;
  title: string;
  description: string;
  title_hi?: string;
  description_hi?: string;
  questions: string[];
  createdBy: string;
  totalQuestions: number;
  durationInMinutes: number;
  languageOptions: string[];
  type: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  status: string;
  testType?: string;
  group: string[];
  attemptedUsers: string[];
  isAllIndia: boolean;
  createdAt: string;
  updatedAt: string;
  deletionAt?: string;
  marksPerQuestion?: number;
  totalMarks?: number;
}

interface QuizApiResponse {
  success: boolean;
  message?: string;
  data: QuizData;
}

const QuizPreview = () => {
  const { groupId, quizId } = useParams<{ groupId: string; quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError } = useGetSingleQuiz(quizId || "");

  useEffect(() => {
    if (data && (data as QuizApiResponse).success) {
      setQuiz((data as QuizApiResponse).data);
      setError(null);
    } else if (data && !(data as QuizApiResponse).success) {
      setError((data as QuizApiResponse).message || "Failed to load quiz details");
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message || "Failed to load quiz details");
    }
  }, [queryError]);

  const formatDuration = (durationInSeconds: number) => {
    const minutes = durationInSeconds / 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${Math.floor(minutes)}m`;
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date && !time) return "—";
    if (!date) return time || "—";
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    if (!time) return dateStr;
    return `${dateStr} • ${time}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "published":
        return <Badge className="bg-blue-100 text-blue-800">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTestTypeBadge = (testType?: string) => {
    if (!testType) return null;
    const value = String(testType).toLowerCase();
    if (value === "paid") {
      return <Badge className="bg-emerald-100 text-emerald-800">Paid</Badge>;
    }
    if (value === "free") {
      return <Badge className="bg-slate-100 text-slate-700">Free</Badge>;
    }
    return <Badge variant="secondary">{testType}</Badge>;
  };

  if (isLoading && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quiz details..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Quiz
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "Quiz not found"}
          </p>
          <Button
            onClick={() => {
              if (groupId) {
                navigate(`/groups/${groupId}?tab=quizzes`);
              } else {
                navigate(-1);
              }
            }}
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (groupId) {
                  navigate(`/groups/${groupId}?tab=quizzes`);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {quiz.title}
                  </CardTitle>
                  {quiz.title_hi && (
                    <p className="text-lg text-gray-700 mt-1">
                      {quiz.title_hi}
                    </p>
                  )}
                  <p className="text-gray-600 mt-2">
                    {quiz.description}
                  </p>
                  {quiz.description_hi && (
                    <p className="text-gray-600 mt-1">
                      {quiz.description_hi}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-3 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDuration(quiz.durationInMinutes)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <FileText size={14} />
                      <span>{quiz.totalQuestions} questions</span>
                    </span>
                    {quiz.totalMarks !== undefined && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Award size={14} />
                          <span>{quiz.totalMarks} marks</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(quiz.status)}
                    {getTestTypeBadge(quiz.testType)}
                  </div>
                  {quiz.languageOptions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {quiz.languageOptions.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{quiz.totalQuestions}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">
                {formatDuration(quiz.durationInMinutes)}
              </p>
              <p className="text-sm text-gray-600">Duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="text-yellow-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">
                {quiz.totalMarks !== undefined ? quiz.totalMarks : quiz.marksPerQuestion ?? "—"}
              </p>
              <p className="text-sm text-gray-600">
                {quiz.totalMarks !== undefined ? "Total Marks" : "Marks / Question"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="text-purple-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold capitalize">{quiz.type}</p>
              <p className="text-sm text-gray-600">Quiz Type</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start</span>
                <span>{formatDateTime(quiz.startDate, quiz.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End</span>
                <span>{formatDateTime(quiz.endDate, quiz.endTime)}</span>
              </div>
              {quiz.deletionAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires</span>
                  <span className="text-amber-700">
                    {new Date(quiz.deletionAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created At</span>
                <span>{new Date(quiz.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span>{new Date(quiz.updatedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience & Attempts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Groups</span>
                <span className="flex items-center space-x-1">
                  <Users size={14} className="text-gray-500" />
                  <span>{quiz.group?.length || 0}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attempted Users</span>
                <span>{quiz.attemptedUsers?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">All India</span>
                <span className="flex items-center space-x-1">
                  <Globe size={14} className={quiz.isAllIndia ? "text-green-600" : "text-gray-400"} />
                  <span>{quiz.isAllIndia ? "Yes" : "No"}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;

