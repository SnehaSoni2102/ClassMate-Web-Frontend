import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import moment from "moment";
import { MathText } from "@/components/shared/MathText";

interface TestDetailsProps {
  test: any;
}

export default function TestDetails({ test }: TestDetailsProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Test Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <div className="text-muted-foreground">
              <MathText text={test.description} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Type</h3>
              {test.type === "mock" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <FileText className="h-3 w-3 mr-1" />
                  Mock
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium">Duration</h3>
              <p>{Math.floor(test.durationInMinutes / 60)} minutes</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Total Questions</h3>
              <p>{test.totalQuestions}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Total Sections</h3>
              <p>{test.totalSections}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Total Marks</h3>
              <p>{test.totalMarks}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Marks per Question</h3>
              <p>{test.marksPerQuestion}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Negative Marks</h3>
              <p>{test.negativeMarks}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Exam</h3>
              <p>{(test as any).examName || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Created At</h3>
              <p>{moment(test.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Updated At</h3>
              <p>{moment(test.updatedAt).format('DD MMM YYYY, hh:mm A')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 