import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useReportQuestion } from "@/lib/api/mutations/create-question-mutation";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReportQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  questionText: string;
}

const ReportQuestionDialog: React.FC<ReportQuestionDialogProps> = ({
  open,
  onOpenChange,
  questionId,
  questionText,
}) => {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const reportQuestion = useReportQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for reporting this question.",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportQuestion.mutateAsync({
        questionId,
        reasons: [reason.trim()]
      });

      toast({
        title: "Question reported successfully",
        description: "Thank you for helping us improve our content.",
      });

      // Reset and close dialog
      setReason("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to report question",
        description: error.message || "An error occurred while reporting the question.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Report Question
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Preview:</Label>
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-20 overflow-y-auto">
              {questionText}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for reporting *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this question (e.g., wrong answer, out of syllabus, unclear question, etc.)"
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={reportQuestion.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reportQuestion.isPending || !reason.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {reportQuestion.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reporting...
                </>
              ) : (
                'Report Question'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportQuestionDialog;
