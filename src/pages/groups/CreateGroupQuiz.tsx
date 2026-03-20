import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GroupService } from "@/services/group.service";
import { GroupApiResponse } from "@/types/group";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import SectionQuestionsDialog from "@/components/shared/SectionQuestionsDialog";
import ReportQuestionDialog from "@/components/ReportQuestionDialog";
import { MathJaxProvider } from "@/components/providers/MathJaxProvider";
import { MathText } from "@/components/shared/MathText";

const LANGUAGE_OPTIONS = ["English", "Hindi"];

export default function CreateGroupQuiz() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [groupData, setGroupData] = useState<GroupApiResponse | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);

  const [exams, setExams] = useState<Option[]>([]);
  const [quiz, setQuiz] = useState({
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    exam: "",
    languageOptions: LANGUAGE_OPTIONS as string[],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  // When true, backend may ignore start/end scheduling fields.
  const [scheduleNow, setScheduleNow] = useState(false);

  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [questionObjs, setQuestionObjs] = useState<any[]>([]);
  // Per-question time in minutes (used to derive total duration).
  const [questionTimeById, setQuestionTimeById] = useState<Record<string, number>>(
    {}
  );
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [questionLang, setQuestionLang] = useState<"en" | "hi">("en");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [alreadyUsedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) {
        setGroupError("Group ID is required");
        setIsGroupLoading(false);
        return;
      }
      try {
        setIsGroupLoading(true);
        setGroupError(null);
        const response = await GroupService.getGroup(groupId);
        setGroupData(response);
      } catch (error: any) {
        console.error("Load group error:", error);
        setGroupError(error.message || "Failed to load group details");
      } finally {
        setIsGroupLoading(false);
      }
    };
    loadGroupData();
  }, [groupId]);

  const getUserRole = (): string => {
    if (!user?._id || !groupData) return "member";
    const member = groupData.members.find((m) => {
      if (typeof m.user === "string") return m.user === user._id;
      return (m.user as { _id?: string })?._id === user._id;
    });
    return member?.role || "member";
  };

  const canCreateQuiz = (): boolean => {
    return getUserRole() === "group-admin";
  };

  const handleQuizChange = (field: string, value: any) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuestions = (selected: any[]) => {
    setQuestionObjs(selected);
    const selectedIds = selected.map((q) => q._id);
    setQuestionIds(selectedIds);
    // Preserve existing per-question times where possible; otherwise default to 1 minute.
    setQuestionTimeById((prev) => {
      const next: Record<string, number> = {};
      selectedIds.forEach((id) => {
        next[id] = prev[id] ?? 1;
      });
      return next;
    });
    setQuestionsDialogOpen(false);
  };

  const handleAddCreatedQuestion = (q: any) => {
    setQuestionObjs((prev) => [...prev, q]);
    setQuestionIds((prev) => [...prev, q._id]);
    setQuestionTimeById((prev) => ({ ...prev, [q._id]: prev[q._id] ?? 1 }));
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestionObjs((prev) => prev.filter((q) => q._id !== questionId));
    setQuestionIds((prev) => prev.filter((id) => id !== questionId));
    setQuestionTimeById((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleReportQuestion = (questionId: string, questionText: string) => {
    setReportingQuestion({ id: questionId, text: questionText });
    setReportDialogOpen(true);
  };

  const totalQuestions = questionIds.length;
  const durationInMinutes = questionIds.reduce((sum, id) => {
    const t = questionTimeById[id] ?? 1;
    return sum + (Number.isFinite(t) ? t : 1);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    if (totalQuestions === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to the quiz.",
        variant: "destructive",
      });
      return;
    }
    if (durationInMinutes <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid time (in minutes) for each question.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        title: quiz.title,
        description: quiz.description,
        title_hi: quiz.title_hi || undefined,
        description_hi: quiz.description_hi || undefined,
        scheaduleNow: scheduleNow,
        totalQuestions,
        durationInMinutes,
        languageOptions: quiz.languageOptions,
        startDate: quiz.startDate,
        startTime: quiz.startTime,
        endDate: quiz.endDate,
        endTime: quiz.endTime,
        // New API contract expects per-question time
        questions: questionIds.map((questionId) => ({
          questionId,
          timeInMinutes: questionTimeById[questionId] ?? 1,
        })),
      } as any;
      if (quiz.exam) payload.exam = quiz.exam;
      // The backend endpoint was updated; include groupId for safety.
      payload.groupId = groupId;

      const created = await GroupService.createGroupQuiz(groupId, payload);
      toast({
        title: "Quiz created successfully!",
        description: "The quiz has been created and added to the group.",
      });
      navigate(`/groups/${groupId}?tab=quizzes`);
    } catch (error: any) {
      toast({
        title: "Failed to create quiz",
        description:
          error.message || "An error occurred while creating the quiz.",
        variant: "destructive",
      });
    }
  };

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading group details..." />
      </div>
    );
  }

  if (groupError || !groupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Group
          </h3>
          <p className="text-gray-600 mb-4">
            {groupError || "Group not found"}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!canCreateQuiz()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            Only group admins can create quizzes for this group.
          </p>
          <Button
            onClick={() => navigate(`/groups/${groupId}`)}
            variant="outline"
          >
            Back to Group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MathJaxProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link to={`/groups/${groupId}?tab=quizzes`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Group
                </Button>
              </Link>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Quiz
              </h1>
              <p className="text-gray-600 mt-2">
                Create a new quiz for the group:{" "}
                <span className="font-semibold">{groupData.title}</span>
              </p>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title (English)</Label>
                    <Input
                      id="title"
                      value={quiz.title}
                      onChange={(e) =>
                        handleQuizChange("title", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_hi">Quiz Title (Hindi)</Label>
                    <Input
                      id="title_hi"
                      value={quiz.title_hi}
                      onChange={(e) =>
                        handleQuizChange("title_hi", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (English)</Label>
                    <Textarea
                      id="description"
                      value={quiz.description}
                      onChange={(e) =>
                        handleQuizChange("description", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_hi">Description (Hindi)</Label>
                    <Textarea
                      id="description_hi"
                      value={quiz.description_hi}
                      onChange={(e) =>
                        handleQuizChange("description_hi", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam</Label>
                    <ExamSelector
                      multiple={false}
                      value={exams}
                      onChange={(val) => {
                        setExams(val || []);
                        handleQuizChange("exam", val?.[0]?.value || "");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleNow">Schedule now</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="scheduleNow"
                        type="checkbox"
                        checked={scheduleNow}
                        onChange={(e) => setScheduleNow(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-600">
                        {scheduleNow ? "Start immediately" : "Schedule for later"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={quiz.startDate}
                      onChange={(e) =>
                        handleQuizChange("startDate", e.target.value)
                      }
                      required={!scheduleNow}
                      disabled={scheduleNow}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={quiz.startTime}
                      onChange={(e) =>
                        handleQuizChange("startTime", e.target.value)
                      }
                      required={!scheduleNow}
                      disabled={scheduleNow}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={quiz.endDate}
                      onChange={(e) =>
                        handleQuizChange("endDate", e.target.value)
                      }
                      required={!scheduleNow}
                      disabled={scheduleNow}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={quiz.endTime}
                      onChange={(e) =>
                        handleQuizChange("endTime", e.target.value)
                      }
                      required={!scheduleNow}
                      disabled={scheduleNow}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationInMinutes">
                      Total Duration (minutes)
                    </Label>
                    <Input
                      id="durationInMinutes"
                      value={durationInMinutes}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      tabIndex={-1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Questions</Label>
                    <Input
                      value={totalQuestions}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Manage Questions (
                  {questionIds.length})
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={questionLang === "en" ? "default" : "outline"}
                    onClick={() => setQuestionLang("en")}
                  >
                    EN
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={questionLang === "hi" ? "default" : "outline"}
                    onClick={() => setQuestionLang("hi")}
                  >
                    HI
                  </Button>
                </div>
                {questionObjs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Serial No</TableHead>
                          <TableHead className="w-1/2">Question</TableHead>
                          <TableHead>Options</TableHead>
                          <TableHead>Correct</TableHead>
                          <TableHead className="w-32">Time (min)</TableHead>
                          <TableHead>Report</TableHead>
                          <TableHead>Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questionObjs.map((q) => (
                          <TableRow key={q._id}>
                            <TableCell className="text-center font-mono text-xs">
                              {q.serial_no || "-"}
                            </TableCell>
                            <TableCell className="whitespace-pre-line max-w-xs">
                              <MathText
                                text={
                                  questionLang === "hi" && q.text_hi
                                    ? q.text_hi
                                    : q.text
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {(questionLang === "hi"
                                ? q.options_hi
                                : q.options
                              )?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {(questionLang === "hi"
                                    ? q.options_hi
                                    : q.options
                                  ).map((opt: string, i: number) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-bold">
                                        {String.fromCharCode(65 + i)}.
                                      </span>{" "}
                                      <MathText text={opt} inline />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {(questionLang === "hi"
                                ? q.correctAnswers_hi
                                : q.correctAnswers
                              )?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {(questionLang === "hi"
                                    ? q.correctAnswers_hi
                                    : q.correctAnswers
                                  ).map((ans: string, i: number) => (
                                    <div key={i} className="text-xs">
                                      <MathText text={ans} inline />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="w-32">
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                value={questionTimeById[q._id] ?? 1}
                                onChange={(e) => {
                                  const raw = Number(e.target.value);
                                  setQuestionTimeById((prev) => ({
                                    ...prev,
                                    [q._id]: raw > 0 && Number.isFinite(raw) ? raw : 1,
                                  }));
                                }}
                                className="h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="p-0 h-6 w-6 text-orange-500 hover:text-orange-600"
                                onClick={() =>
                                  handleReportQuestion(q._id, q.text)
                                }
                                title="Report this question"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="p-0 h-6 w-6"
                                onClick={() => handleRemoveQuestion(q._id)}
                              >
                                ×
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    No questions selected. Click &quot;Manage Questions&quot; to
                    add questions from the question bank.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/groups/${groupId}?tab=quizzes`)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Quiz</Button>
            </div>
          </form>

          {questionsDialogOpen && (
            <SectionQuestionsDialog
              open={questionsDialogOpen}
              onOpenChange={setQuestionsDialogOpen}
              initialSelected={questionObjs}
              onSave={handleSaveQuestions}
              onCreateQuestion={handleAddCreatedQuestion}
              groupId={groupId}
              marks={0}
              negativeMarks={0}
              alreadyUsedQuestionIds={alreadyUsedQuestionIds}
            />
          )}

          {reportingQuestion && (
            <ReportQuestionDialog
              open={reportDialogOpen}
              onOpenChange={setReportDialogOpen}
              questionId={reportingQuestion.id}
              questionText={reportingQuestion.text}
            />
          )}
        </div>
      </div>
    </MathJaxProvider>
  );
}
