import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetQuestions } from "@/hooks/useGetQuestions";
import CreateQuestionDialog from "@/pages/tests/CreateQuestionDialog";
import ExamSelector from "@/components/selectors/ExamSelector";
import ClassSelector from "@/components/selectors/ClassSelector";
import SubjectSelector from "@/components/selectors/SubjectSelector";
import { Option } from "@/components/ui/multiple-selector";
import { MathText } from "@/components/shared/MathText";
import { MathJaxProvider } from "@/components/providers/MathJaxProvider";

export default function SectionQuestionsDialog({
  open,
  onOpenChange,
  initialSelected,
  onSave,
  onCreateQuestion,
  groupId,
  marks = 4,
  negativeMarks = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelected: any[]; // now full question objects
  onSave: (selected: any[]) => void;
  onCreateQuestion: (q: any) => void;
  groupId?: string;
  marks?: number;
  negativeMarks?: number;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  // Use a map for selected questions by _id
  const [selectedMap, setSelectedMap] = useState<{ [id: string]: any }>({});
  const [lang, setLang] = useState<"en" | "hi">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("section-question-search-lang") as "en" | "hi") ||
        "en"
      );
    }
    return "en";
  });

  // Filter states
  const [selectedExams, setSelectedExams] = useState<Option[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Option[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Option[]>([]);

  // Memoized filter arrays to prevent unnecessary re-renders
  const examIds = useMemo(() => selectedExams.map(exam => exam.value), [selectedExams]);
  const classIds = useMemo(() => selectedClasses.map(classItem => classItem.value), [selectedClasses]);
  const subjectIds = useMemo(() => selectedSubjects.map(subject => subject.value), [selectedSubjects]);

  useEffect(() => {
    // Populate selectedMap from initialSelected only when dialog opens
    // Note: We intentionally don't include initialSelected in deps to preserve
    // user selections when new questions are created and initialSelected changes
    if (open) {
      const map: { [id: string]: any } = {};
      (initialSelected || []).forEach((q: any) => {
        map[q._id] = q;
      });
      setSelectedMap(map);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("section-question-search-lang", lang);
    }
  }, [lang]);

  const { data, isLoading } = useGetQuestions({
    questionType: "all",
    searchTerm: debouncedSearch,
    page,
    examIds,
    classIds,
    subjectIds,
  });

  // Map questions to options with both EN and HI labels
  const options: any[] = data?.data?.data?.questions || [];
  const totalPages = data?.data?.data?.pagination?.totalPages || 1;


  // Selection logic
  const isSelected = (id: string) => !!selectedMap[id];
  const toggleSelect = (q: any) => {
    setSelectedMap((prev) => {
      const copy = { ...prev };
      if (copy[q._id]) {
        delete copy[q._id];
      } else {
        copy[q._id] = q;
      }
      return copy;
    });
  };

  const handleSave = () => {
    onSave(Object.values(selectedMap));
    onOpenChange(false);
  };

  const handleCreateQuestion = (q: any) => {
    setSelectedMap((prev) => ({ ...prev, [q._id]: q }));
    onCreateQuestion(q);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6">
        <MathJaxProvider>
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Manage Section Questions</DialogTitle>
          </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Search and Language Controls */}
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
              Questions in the question bank may have some mistakes, kindly check those questions before implementation.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-2 items-center flex-1 min-w-0">
                <Input
                  placeholder={
                    lang === "en"
                      ? "Search questions (English)..."
                      : "Search questions (Hindi)..."
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 text-sm"
                />
                <div className="flex gap-1 items-center flex-shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "en" ? "default" : "outline"}
                    onClick={() => setLang("en")}
                    className="px-3"
                  >
                    EN
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "hi" ? "default" : "outline"}
                    onClick={() => setLang("hi")}
                    className="px-3"
                  >
                    HI
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 items-center">
                <CreateQuestionDialog
                  trigger={
                    <Button type="button" size="sm" variant="outline" className="text-xs">
                      + New Question
                    </Button>
                  }
                  onSuccess={handleCreateQuestion}
                  groupId={groupId}
                  marks={marks}
                  negativeMarks={negativeMarks}
                />
                <p className="text-xs text-muted-foreground">
                  {Object.keys(selectedMap).length} selected
                </p>
              </div>
            </div>
          </div>

          {/* Filter Selectors */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Exam Filter</label>
              <ExamSelector
                value={selectedExams}
                onChange={(val) => {
                  setSelectedExams(val);
                  setPage(1);
                }}
                multiple={true}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Class Filter</label>
              <ClassSelector
                value={selectedClasses}
                onChange={(val) => {
                  setSelectedClasses(val);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-gray-700">Subject Filter</label>
              <SubjectSelector
                value={selectedSubjects}
                onChange={(val) => {
                  setSelectedSubjects(val);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedExams.length > 0 || selectedClasses.length > 0 || selectedSubjects.length > 0) && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedExams([]);
                  setSelectedClasses([]);
                  setSelectedSubjects([]);
                  setPage(1);
                }}
                className="text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
          {/* Question list with checkboxes */}
          <div className="border rounded-md divide-y min-h-[200px] max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No questions found.
              </div>
            ) : (
              options.map((q) => (
                <label
                  key={q._id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={isSelected(q._id)}
                    onChange={() => toggleSelect(q)}
                    className="accent-blue-600"
                  />
                  <span className="line-clamp-2">
                    {q.serial_no && <span className="font-mono text-xs text-gray-500 mr-2">#{q.serial_no}</span>}
                    <MathText text={lang === "hi" && q.text_hi ? q.text_hi : q.text} inline />
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs"
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-sm"
            >
              Save Selection
            </Button>
          </div>
        </div>
        </MathJaxProvider>
      </DialogContent>
    </Dialog>
  );
} 