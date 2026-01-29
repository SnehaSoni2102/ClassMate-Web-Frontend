import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GroupService } from "@/services/group.service";
import { GroupApiResponse } from "@/types/group";
import { Test } from "@/types/test";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import selectors and components
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";
import SectionQuestionsDialog from "@/components/shared/SectionQuestionsDialog";
import ReportQuestionDialog from "@/components/ReportQuestionDialog";
import { MathJaxProvider } from "@/components/providers/MathJaxProvider";
import { MathText } from "@/components/shared/MathText";

const LANGUAGE_OPTIONS = ["English", "Hindi"];

export default function CreateGroupTest() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Group data state
  const [groupData, setGroupData] = useState<GroupApiResponse | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  
  // Test creation state
  const [exams, setExams] = useState<Option[]>([]);
  const [test, setTest] = useState({
    title: "",
    title_hi: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    totalQuestions: 0,
    totalSections: 0,
    durationInMinutes: 0,
    totalMarks: 0,
    marksPerQuestion: 0,
    negativeMarks: 0,
    description: "",
    description_hi: "",
    languageOptions: LANGUAGE_OPTIONS,
    type: "mock" as "mock" | "live",
    exam: exams?.[0]?.value || "",
    testType: "paid" as const,
  });

  // State for sections
  const [sections, setSections] = useState([
    {
      name: "",
      name_hi: "",
      order: 1,
      timeLimit: 0,
      questionIds: [] as string[],
      questionObjs: [] as any[],
    },
  ]);

  // Dialog state
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);

  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Section language display state
  const [sectionLangs, setSectionLangs] = useState<{
    [idx: number]: "en" | "hi";
  }>({});

  // Load group data
  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) {
        setGroupError('Group ID is required');
        setIsGroupLoading(false);
        return;
      }

      try {
        setIsGroupLoading(true);
        setGroupError(null);
        const response = await GroupService.getGroup(groupId);
        setGroupData(response);
      } catch (error: any) {
        console.error('Load group error:', error);
        setGroupError(error.message || 'Failed to load group details');
      } finally {
        setIsGroupLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  // Helper function to get user role from group members
  const getUserRole = (): string => {
    if (!user?._id || !groupData) return 'member';
    
    const member = groupData.members.find(m => {
      if (typeof m.user === 'string') {
        return m.user === user._id;
      }
      return m.user?._id === user._id;
    });
    
    return member?.role || 'member';
  };

  // Check if user can create tests
  const canCreateTests = (): boolean => {
    const userRole = getUserRole();
    return userRole === 'group-admin' || userRole === 'manager' || userRole === 'group-manager';
  };

  // Handlers for test info
  const handleTestChange = (field: string, value: any) => {
    setTest((prev) => ({ ...prev, [field]: value }));
  };

  // Section management
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        name: "",
        name_hi: "",
        order: prev.length + 1,
        timeLimit: 0,
        questionIds: [],
        questionObjs: [],
      },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const handleSectionChange = (idx: number, field: string, value: any) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx ? { ...section, [field]: value } : section
      )
    );
  };

  // Save questions for a section
  const handleSaveSectionQuestions = (idx: number, selected: any[]) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx
          ? {
              ...section,
              questionIds: selected.map((q) => q._id),
              questionObjs: selected,
            }
          : section
      )
    );
    setActiveSectionIdx(null);
  };

  // Add new question to section after dialog success
  const handleAddCreatedQuestion = (idx: number, question: any) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === idx
          ? {
              ...section,
              questionIds: [...section.questionIds, question._id],
              questionObjs: [...section.questionObjs, question],
            }
          : section
      )
    );
  };

  // Remove question from section
  const handleRemoveQuestionFromSection = (
    sectionIdx: number,
    questionId: string
  ) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIdx
          ? {
              ...section,
              questionIds: section.questionIds.filter(
                (id) => id !== questionId
              ),
              questionObjs: section.questionObjs.filter(
                (q) => q._id !== questionId
              ),
            }
          : section
      )
    );
  };

  // Handle report question dialog
  const handleReportQuestion = (questionId: string, questionText: string) => {
    setReportingQuestion({ id: questionId, text: questionText });
    setReportDialogOpen(true);
  };

  // Calculate totalQuestions and totalMarks dynamically
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questionIds.length,
    0
  );
  const totalMarks = test.marksPerQuestion * totalQuestions;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: exam selection
    if (!test.exam) {
      toast({
        title: "Exam required",
        description: "Please select an exam for this test.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation: section time limits
    const sumSectionTimes = sections.reduce(
      (sum, s) => sum + Number(s.timeLimit || 0),
      0
    );
    if (sections.some((s) => !s.timeLimit || Number(s.timeLimit) <= 0)) {
      toast({
        title: "Section time required",
        description: "Each section must have a time limit greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (sumSectionTimes > test.durationInMinutes) {
      toast({
        title: "Section time exceeds test duration",
        description: `Sum of all section time limits (${sumSectionTimes} min) cannot exceed total test duration (${test.durationInMinutes} min).`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare test data for API
      const testData = {
        ...test,
        totalQuestions,
        totalSections: sections.length,
        totalMarks,
        exam: test.exam,
        durationInMinutes: test.durationInMinutes, // Convert to milliseconds
        sections: sections.map((s) => ({
          name: s.name,
          name_hi: s.name_hi,
          order: s.order,
          timeLimit: s.timeLimit,
          questionIds: s.questionIds,
        })),
      };

      // Remove live-specific fields for mock tests
      if (test.type === "mock") {
        delete testData.endDate;
        delete testData.endTime;
        delete testData.startDate;
        delete testData.startTime;
      }

      const response = await GroupService.createGroupTest(groupId!, testData);
      console.log({response});
      toast({
        title: "Test created successfully!",
        description: "The test has been created and added to the group.",
      });

      // Redirect to test preview page
      navigate(`/groups/${groupId}/test-preview/${response._id}`);
    } catch (error: any) {
      console.error('Create group test error:', error);
      toast({
        title: "Failed to create test",
        description: error.message || "An error occurred while creating the test.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading group details..." />
      </div>
    );
  }

  // Error state
  if (groupError || !groupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Group</h3>
          <p className="text-gray-600 mb-4">{groupError || 'Group not found'}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canCreateTests()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to create tests in this group.</p>
          <Button onClick={() => navigate(`/groups/${groupId}`)} variant="outline">
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to={`/groups/${groupId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2" size={16} />
                Back to Group
              </Button>
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Test</h1>
            <p className="text-gray-600 mt-2">
              Create a new test for the group: <span className="font-semibold">{groupData.title}</span>
            </p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title (English)</Label>
                  <Input
                    id="title"
                    value={test.title}
                    onChange={(e) => handleTestChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_hi">Test Title (Hindi)</Label>
                  <Input
                    id="title_hi"
                    value={test.title_hi}
                    onChange={(e) =>
                      handleTestChange("title_hi", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (English)</Label>
                  <Textarea
                    id="description"
                    value={test.description}
                    onChange={(e) =>
                      handleTestChange("description", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_hi">Description (Hindi)</Label>
                  <Textarea
                    id="description_hi"
                    value={test.description_hi}
                    onChange={(e) =>
                      handleTestChange("description_hi", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <RadioGroup
                    value={test.type}
                    onValueChange={(val) =>
                      handleTestChange("type", val as "mock" | "live")
                    }
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mock" id="mock" />
                      <Label htmlFor="mock">Mock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="live" />
                      <Label htmlFor="live">Live</Label>
                    </div>
                  </RadioGroup>
                </div>



                <div className="space-y-2">
                  <Label>Exam</Label>
                  <ExamSelector
                    multiple={false}
                    value={exams}
                    onChange={(val) => {
                      setExams(val);
                      handleTestChange("exam", val?.[0]?.value || "");
                    }}
                  />
                </div>

                {test.type === "live" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={test.startDate}
                        onChange={(e) =>
                          handleTestChange("startDate", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={test.startTime}
                        onChange={(e) =>
                          handleTestChange("startTime", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={test.endDate}
                        onChange={(e) =>
                          handleTestChange("endDate", e.target.value)
                        }
                        required={test.type === "live"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={test.endTime}
                        onChange={(e) =>
                          handleTestChange("endTime", e.target.value)
                        }
                        required={test.type === "live"}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="durationInMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationInMinutes"
                    type="number"
                    min={1}
                    value={test.durationInMinutes}
                    onChange={(e) =>
                      handleTestChange(
                        "durationInMinutes",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min={1}
                    value={totalMarks}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    tabIndex={-1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marksPerQuestion">Marks per Question</Label>
                  <Input
                    id="marksPerQuestion"
                    type="number"
                    min={0}
                    value={test.marksPerQuestion}
                    onChange={(e) =>
                      handleTestChange(
                        "marksPerQuestion",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min={0}
                    step={0.01}
                    value={test.negativeMarks}
                    onChange={(e) =>
                      handleTestChange("negativeMarks", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <Button
                type="button"
                onClick={addSection}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, idx) => {
                const lang = sectionLangs[idx] || "en";
                return (
                  <div
                    key={idx}
                    className="border rounded-md p-4 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Section {idx + 1}</div>
                      {sections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name (English)</Label>
                        <Input
                          value={section.name}
                          onChange={(e) =>
                            handleSectionChange(idx, "name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (Hindi)</Label>
                        <Input
                          value={section.name_hi}
                          onChange={(e) =>
                            handleSectionChange(idx, "name_hi", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          min={1}
                          value={section.order}
                          onChange={(e) =>
                            handleSectionChange(
                              idx,
                              "order",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Limit (minutes)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={section.timeLimit}
                          onChange={(e) =>
                            handleSectionChange(
                              idx,
                              "timeLimit",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    {/* Question selection UI */}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Label>Questions</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSectionIdx(idx)}
                        >
                          Manage Questions ({section.questionIds.length})
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={lang === "en" ? "default" : "outline"}
                          onClick={() =>
                            setSectionLangs((prev) => ({
                              ...prev,
                              [idx]: "en",
                            }))
                          }
                        >
                          EN
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={lang === "hi" ? "default" : "outline"}
                          onClick={() =>
                            setSectionLangs((prev) => ({
                              ...prev,
                              [idx]: "hi",
                            }))
                          }
                        >
                          HI
                        </Button>
                      </div>
                      {/* Table of selected questions */}
                      {section.questionObjs.length > 0 && (
                        <div className="overflow-x-auto">
                          <Table className="text-xs">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">
                                  Serial No
                                </TableHead>
                                <TableHead className="w-1/2">
                                  Question
                                </TableHead>
                                <TableHead>Options</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Report</TableHead>
                                <TableHead>Remove</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {section.questionObjs.map((q) => (
                                <TableRow key={q._id}>
                                  <TableCell className="text-center font-mono text-xs">
                                    {q.serial_no || '-'}
                                  </TableCell>
                                  <TableCell className="whitespace-pre-line max-w-xs">
                                    {(() => {
                                      const text = lang === "hi" && q.text_hi
                                        ? q.text_hi
                                        : q.text;
                                      return <MathText text={text} />;
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    {/* Render options as A, B, C, D... */}
                                    {(lang === "hi" ? q.options_hi : q.options)
                                      ?.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {(lang === "hi"
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
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {/* Render correct answers */}
                                    {(lang === "hi"
                                      ? q.correctAnswers_hi
                                      : q.correctAnswers
                                    )?.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {(lang === "hi"
                                          ? q.correctAnswers_hi
                                          : q.correctAnswers
                                        ).map((ans: string, i: number) => (
                                          <div key={i} className="text-xs">
                                            <MathText text={ans} inline />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="p-0 h-6 w-6 text-orange-500 hover:text-orange-600"
                                      onClick={() => handleReportQuestion(q._id, q.text)}
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
                                      onClick={() =>
                                        handleRemoveQuestionFromSection(
                                          idx,
                                          q._id
                                        )
                                      }
                                    >
                                      ×
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                navigate(`/groups/${groupId}`);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Test
            </Button>
          </div>
        </form>
        
        {/* Section Questions Dialog */}
        {activeSectionIdx !== null && (
          <SectionQuestionsDialog
            open={activeSectionIdx !== null}
            onOpenChange={(open) =>
              setActiveSectionIdx(open ? activeSectionIdx : null)
            }
            initialSelected={sections[activeSectionIdx].questionObjs}
            onSave={(selected) =>
              handleSaveSectionQuestions(activeSectionIdx, selected)
            }
            onCreateQuestion={(q) =>
              handleAddCreatedQuestion(activeSectionIdx, q)
            }
            groupId={groupId}
            marks={test.marksPerQuestion}
            negativeMarks={test.negativeMarks}
          />
        )}

        {/* Report Question Dialog */}
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