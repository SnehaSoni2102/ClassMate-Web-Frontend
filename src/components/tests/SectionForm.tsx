import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface SectionFormProps {
  sections: any[];
  onAddSection: () => void;
  onRemoveSection: (idx: number) => void;
  onSectionChange: (idx: number, field: string, value: any) => void;
  onManageQuestions: (idx: number) => void;
  onRemoveQuestion: (sectionIdx: number, questionId: string) => void;
  sectionLangs: { [idx: number]: "en" | "hi" };
  onSectionLangChange: (idx: number, lang: "en" | "hi") => void;
}

export default function SectionForm({
  sections,
  onAddSection,
  onRemoveSection,
  onSectionChange,
  onManageQuestions,
  onRemoveQuestion,
  sectionLangs,
  onSectionLangChange,
}: SectionFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sections</CardTitle>
        <Button type="button" onClick={onAddSection} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, idx) => {
          const lang = sectionLangs[idx] || "en";
          return (
            <div
              key={section._id || idx}
              className="border rounded-md p-4 space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">Section {idx + 1}</div>
                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSection(idx)}
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
                    onChange={(e) => onSectionChange(idx, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (Hindi)</Label>
                  <Input
                    value={section.name_hi}
                    onChange={(e) => onSectionChange(idx, "name_hi", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={section.order}
                    onChange={(e) => onSectionChange(idx, "order", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={section.timeLimit}
                    onChange={(e) => onSectionChange(idx, "timeLimit", Number(e.target.value))}
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
                    onClick={() => onManageQuestions(idx)}
                  >
                    Manage Questions ({section.questionIds.length})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "en" ? "default" : "outline"}
                    onClick={() => onSectionLangChange(idx, "en")}
                  >
                    EN
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "hi" ? "default" : "outline"}
                    onClick={() => onSectionLangChange(idx, "hi")}
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
                          <TableHead className="w-1/2">Question</TableHead>
                          <TableHead>Options</TableHead>
                          <TableHead>Correct</TableHead>
                          <TableHead>Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.questionObjs.map((q: any) => (
                          <TableRow key={q._id}>
                            <TableCell className="whitespace-pre-line max-w-xs">
                              {lang === "hi" && (q.text_hi || q.question_hi)
                                ? q.text_hi || q.question_hi
                                : q.text || q.question}
                            </TableCell>
                            <TableCell>
                              {/* Render options as A, B, C, D... */}
                              {(lang === "hi" ? q.options_hi : q.options)?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {(lang === "hi" ? q.options_hi : q.options).map(
                                    (opt: string, i: number) => (
                                      <div key={i} className="text-xs">
                                        <span className="font-bold">
                                          {String.fromCharCode(65 + i)}.
                                        </span>{" "}
                                        {opt}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {/* Render correct answers */}
                              {(lang === "hi" ? q.correctAnswers_hi : q.correctAnswers)?.length >
                              0 ? (
                                <div className="flex flex-col gap-1">
                                  {(lang === "hi" ? q.correctAnswers_hi : q.correctAnswers).map(
                                    (ans: string, i: number) => (
                                      <div key={i} className="text-xs">
                                        {ans}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="p-0 h-6 w-6"
                                onClick={() => onRemoveQuestion(idx, q._id)}
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
  );
} 