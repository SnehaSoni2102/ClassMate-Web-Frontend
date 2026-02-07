import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ExamSelector from "@/components/selectors/ExamSelector";
import { Option } from "@/components/ui/multiple-selector";

const LANGUAGE_OPTIONS = ["English", "Hindi"];

interface TestFormProps {
  test: any;
  onTestChange: (field: string, value: any) => void;
  exams: Option[];
  onExamsChange: (exams: Option[]) => void;
  totalMarks: number;
  isSubmitting?: boolean;
}

export default function TestForm({
  test,
  onTestChange,
  exams,
  onExamsChange,
  totalMarks,
  isSubmitting = false,
}: TestFormProps) {
  return (
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
              onChange={(e) => onTestChange("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_hi">Test Title (Hindi)</Label>
            <Input
              id="title_hi"
              value={test.title_hi}
              onChange={(e) => onTestChange("title_hi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={test.description}
              onChange={(e) => onTestChange("description", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_hi">Description (Hindi)</Label>
            <Textarea
              id="description_hi"
              value={test.description_hi}
              onChange={(e) => onTestChange("description_hi", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Test Type</Label>
            <RadioGroup
              value={test.type}
              onValueChange={(val) => onTestChange("type", val as "mock" | "live")}
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
            <Label>Test Fee Type</Label>
            <RadioGroup
              value={test.testType}
              onValueChange={(val) => onTestChange("testType", val as "free" | "paid")}
              className="flex flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Exam</Label>
            <ExamSelector
              multiple={false}
              value={exams}
              onChange={(val) => {
                onExamsChange(val);
                onTestChange("exam", val?.[0]?.value || "");
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
                  onChange={(e) => onTestChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={test.startTime}
                  onChange={(e) => onTestChange("startTime", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={test.endDate}
                  onChange={(e) => onTestChange("endDate", e.target.value)}
                  required={test.type === "live"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={test.endTime}
                  onChange={(e) => onTestChange("endTime", e.target.value)}
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
              onChange={(e) => onTestChange("durationInMinutes", Number(e.target.value))}
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
              onChange={(e) => onTestChange("marksPerQuestion", Number(e.target.value))}
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
              onChange={(e) => onTestChange("negativeMarks", Number(e.target.value))}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 