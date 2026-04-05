import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api-client";
import { useGetSingleQuiz } from "@/lib/api/queries/use-get-single-quiz";
import { useQuizAttemptSSE } from "@/hooks/useQuizAttemptSSE";
import { AlertCircle, ArrowLeft, Radio, SkipForward, Square } from "lucide-react";

type QuizData = {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  durationInMinutes: number;
  status: string;
  testType?: string;
  createdAt: string;
  updatedAt: string;
};

type QuizApiResponse = {
  success: boolean;
  message?: string;
  data: QuizData;
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = String(status || "").toLowerCase();
  if (s === "active") return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  if (s === "in-progress") return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
  if (s === "draft") return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
  if (s === "completed") return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
  if (s === "published") return <Badge className="bg-blue-100 text-blue-800">Published</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
};

export default function ActiveQuizDetails() {
  const { groupId, quizId } = useParams<{ groupId: string; quizId: string }>();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const { data, isLoading, error } = useGetSingleQuiz(quizId || "");
  const quiz = useMemo(() => {
    const r = data as QuizApiResponse | undefined;
    return r?.success ? r.data : null;
  }, [data]);

  const sse = useQuizAttemptSSE({ quizId: quizId || "" });

  const derived = useMemo(() => {
    const last = sse.lastEvent;
    const nextIdx =
      last && last.eventType === "quiz-next-question" ? last.nextQuestionIndex : null;
    const questionId =
      last && "questionId" in last ? (last as any).questionId : undefined;
    const top5 = last && "top5" in last ? (last as any).top5 : undefined;
    return { nextIdx, questionId, top5 };
  }, [sse.lastEvent]);

  const handleManualNext = async () => {
    if (!quizId) return;
    try {
      const body = { currentQuestionIndex };
      const res = await apiClient.post(`/quiz-attempt/manual-next/${quizId}`, body);
      toast({
        title: "Next question triggered",
        description: res?.message || "SSE event should arrive shortly.",
      });
    } catch (e: any) {
      toast({
        title: "Failed to move next",
        description: e?.message || "Request failed.",
        variant: "destructive",
      });
    }
  };

  const handleEndQuiz = async () => {
    if (!quizId) return;
    try {
      const res = await apiClient.post(`/quiz/end/${quizId}`);
      toast({
        title: "Quiz ended",
        description: res?.message || "Quiz was marked as completed.",
      });
    } catch (e: any) {
      toast({
        title: "Failed to end quiz",
        description: e?.message || "Request failed.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Quiz</h3>
          <p className="text-gray-600 mb-4">
            {(error as any)?.message || (data as any)?.message || "Quiz not found"}
          </p>
          <Button asChild variant="outline">
            <Link to={groupId ? `/groups/${groupId}?tab=quizzes` : "/groups"}>Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link to={groupId ? `/groups/${groupId}?tab=quizzes` : "/groups"}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                sse.status === "open"
                  ? "border-green-300 text-green-700"
                  : sse.status === "connecting"
                    ? "border-yellow-300 text-yellow-700"
                    : sse.status === "error"
                      ? "border-red-300 text-red-700"
                      : "border-gray-300 text-gray-700"
              }
            >
              <Radio className="mr-2" size={14} />
              SSE: {sse.status}
            </Badge>
          </div>
        </div>

        {sse.status === "error" && sse.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-800">{sse.error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <span>{quiz.totalQuestions} questions</span>
                  <span>•</span>
                  <span>{Math.round(quiz.durationInMinutes / 60)} mins</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={quiz.status} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Question Index</label>
                <input
                  type="number"
                  min={0}
                  value={currentQuestionIndex}
                  onChange={(e) => setCurrentQuestionIndex(Number(e.target.value))}
                  className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Used for `manual-next` when you click Next.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleManualNext} className="w-full">
                  <SkipForward className="mr-2" size={16} />
                  Manual Next
                </Button>
                <Button onClick={handleEndQuiz} variant="destructive" className="w-full">
                  <Square className="mr-2" size={16} />
                  End Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Realtime Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Next Question Index</span>
                <span className="font-medium">{derived.nextIdx ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Question ID</span>
                <span className="font-medium truncate max-w-[220px]">
                  {derived.questionId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Event Type</span>
                <span className="font-medium">{sse.lastEvent?.eventType || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Event Time</span>
                <span className="font-medium">
                  {(sse.lastEvent as any)?.timestamp
                    ? new Date((sse.lastEvent as any).timestamp).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(derived.top5) && derived.top5.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {derived.top5.map((row: any, idx: number) => (
                    <div
                      key={`${row.userId}-${idx}`}
                      className="flex items-center justify-between border rounded-md px-3 py-2 bg-white"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{row.userId}</div>
                        <div className="text-xs text-gray-500">
                          timeTaken: {row.timeTaken}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">+{row.marks}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No leaderboard data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            {sse.events.length === 0 ? (
              <p className="text-sm text-gray-500">No events received yet.</p>
            ) : (
              <div className="space-y-2">
                {sse.events.map((evt, idx) => (
                  <details
                    key={`${(evt as any)?.timestamp || idx}-${idx}`}
                    className="border rounded-md bg-white px-3 py-2"
                  >
                    <summary className="cursor-pointer text-sm flex items-center justify-between">
                      <span className="font-medium">{evt.eventType}</span>
                      <span className="text-xs text-gray-500">
                        {(evt as any)?.timestamp
                          ? new Date((evt as any).timestamp).toLocaleString()
                          : ""}
                      </span>
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(evt, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

