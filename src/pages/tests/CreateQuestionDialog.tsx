import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateQuestion } from "@/lib/api/mutations/create-question-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Option } from "@/components/ui/multiple-selector";
import { getUploadUrl, uploadFileToS3 } from "@/lib/api/upload";

export default function CreateQuestionDialog({
  onSuccess,
  trigger,
  groupId,
  marks = 4,
  negativeMarks = 1,
}: {
  onSuccess: (question: any) => void;
  trigger: React.ReactNode;
  groupId?: string;
  marks?: number;
  negativeMarks?: number;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [textEN, setTextEN] = useState("");
  const [textHI, setTextHI] = useState("");
  const [solutionEN, setSolutionEN] = useState("");
  const [solutionHI, setSolutionHI] = useState("");
  const [options, setOptions] = useState([
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
    { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
  ]);
  const [error, setError] = useState("");
  const createQuestion = useCreateQuestion();
  const [questionType, setQuestionType] = useState<
    "single_choice" | "multiple_choice"
  >("single_choice");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Selector states
  const [exams, setExams] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [category, setCategory] = useState<string>("");
  const [topics, setTopics] = useState<Option[]>([]);
  
  // Question scoring - now comes from props

  const handleOptionChange = (
    idx: number,
    field: "en" | "hi",
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === idx ? { ...opt, [field]: value } : opt))
    );
  };
  const handleCorrectChange = (
    idx: number,
    field: "isCorrectEN" | "isCorrectHI",
    checked: boolean
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => {
        if (i !== idx) {
          // For single choice, uncheck all others
          if (
            questionType === "single_choice" &&
            checked &&
            ((field === "isCorrectEN" && lang === "en") ||
              (field === "isCorrectHI" && lang === "hi"))
          ) {
            return { ...opt, [field]: false };
          }
          return opt;
        }
        return { ...opt, [field]: checked };
      })
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  // Copy content from English to Hindi
  const copyFromEnglishToHindi = () => {
    setTextHI(textEN);
    setSolutionHI(solutionEN);
    setOptions(prev => prev.map(opt => ({
      ...opt,
      hi: opt.en,
      isCorrectHI: opt.isCorrectEN
    })));
  };

  // Copy content from Hindi to English
  const copyFromHindiToEnglish = () => {
    setTextEN(textHI);
    setSolutionEN(solutionHI);
    setOptions(prev => prev.map(opt => ({
      ...opt,
      en: opt.hi,
      isCorrectEN: opt.isCorrectHI
    })));
  };

  // Copy from current language to the other language
  const copyFromCurrentLanguage = () => {
    if (lang === "en") {
      copyFromEnglishToHindi();
      toast({
        title: "Content Copied",
        description: "Question copied from English to Hindi",
      });
    } else {
      copyFromHindiToEnglish();
      toast({
        title: "Content Copied",
        description: "Question copied from Hindi to English",
      });
    }
  };

  // Check if English fields are properly filled and correct answers selected (solutions optional)
  const isEnglishComplete = () => {
    const hasFilledFields = textEN.trim() &&
                           options.every(opt => opt.en.trim());
    const hasCorrectAnswers = options.some(opt => opt.isCorrectEN);
    return hasFilledFields && hasCorrectAnswers;
  };

  // Check if Hindi fields are properly filled and correct answers selected (solutions optional)
  const isHindiComplete = () => {
    const hasFilledFields = textHI.trim() &&
                           options.every(opt => opt.hi.trim());
    const hasCorrectAnswers = options.some(opt => opt.isCorrectHI);
    return hasFilledFields && hasCorrectAnswers;
  };

  // Check if we can copy from current language to the other language
  const canCopyFromCurrent = () => {
    if (lang === "en") {
      return isEnglishComplete(); // To copy from English to Hindi, English must be complete
    } else {
      return isHindiComplete(); // To copy from Hindi to English, Hindi must be complete
    }
  };

  // Comprehensive validation for form submission (English required; Hindi optional)
  const isFormValidForSubmission = () => {
    const hasQuestionText = textEN.trim();
    const hasAllEnglishOptions = options.every(opt => opt.en.trim());
    const hasEnglishAnswers = options.some(opt => opt.isCorrectEN);
    const hasQuestionType = questionType === "single_choice" || questionType === "multiple_choice";

    if (questionType === "single_choice") {
      const englishCorrectCount = options.filter(o => o.isCorrectEN).length;
      const hindiCorrectCount = options.filter(o => o.isCorrectHI).length;
      if (englishCorrectCount > 1 || hindiCorrectCount > 1) {
        return false; // Single choice can't have multiple correct answers
      }
    }

    return hasQuestionText && hasAllEnglishOptions && hasEnglishAnswers && hasQuestionType;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation for selectors
    // if (exams.length === 0) {
    //   setError("Please select at least one exam.");
    //   return;
    // }
    // if (subjects.length === 0) {
    //   setError("Please select at least one subject.");
    //   return;
    // }
    // if (!category) {
    //   setError("Please select a category.");
    //   return;
    // }
    // if (topics.length === 0) {
    //   setError("Please select at least one topic.");
    //   return;
    // }
    
    // English is required; Hindi is optional
    if (!textEN.trim() || options.some((o) => !o.en.trim())) {
      setError("Please fill all English fields.");
      return;
    }
    const correctCount = options.filter((o) => o.isCorrectEN).length;
    if (correctCount === 0) {
      setError("Select at least one correct answer (English).");
      return;
    }
    if (questionType === "single_choice" && correctCount > 1) {
      setError("Only one correct answer allowed for single choice.");
      return;
    }
    // Upload image if exists
    let imageUrl = "";
    if (imageFile) {
      try {
        const { url, key } = await getUploadUrl(imageFile.type);
        await uploadFileToS3(url, imageFile);
        // The key is the full URL of the uploaded image (without query params)
        // But the API returns key as the full URL in the response example provided by user
        // "key": "https://classmatetest1.s3.ap-south-1.amazonaws.com/questions/..."
        // So we can use key directly.
        imageUrl = key;
      } catch (err) {
        console.error("Image upload failed", err);
        toast({
          title: "Image upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Build JSON payload for API
    const payload = {
      text: textEN,
      text_hi: textHI,
      options: options.map((opt) => opt.en),
      options_hi: options.map((opt) => opt.hi),
      correctAnswers: options
        .filter((o) => o.isCorrectEN)
        .map((o) => o.en),
      correctAnswers_hi: options
        .filter((o) => o.isCorrectHI)
        .map((o) => o.hi),
      marks: marks,
      negativeMarks: negativeMarks,
      isTwoOptions: questionType === "multiple_choice",
      solution: solutionEN,
      solution_hi: solutionHI,
      image: imageUrl,
      groupId: groupId,
    };

    try {
      createQuestion.mutateAsync(payload, {
        onSuccess: async (res) => {
          toast({
            title: "Question created successfully!",
            description: res?.message || "Question has been created.",
          });
          setTextEN("");
          setTextHI("");
          setSolutionEN("");
          setSolutionHI("");
          setLang("en");
          setOptions([
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
            { en: "", hi: "", isCorrectEN: false, isCorrectHI: false },
          ]);
          setImageFile(null);
          setQuestionType("single_choice");
          setExams([]);
          setSubjects([]);
          setCategory("");
          setTopics([]);
          onSuccess(res?.data);
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ["get-test"] });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to create question",
            description:
              err?.response?.data?.message || err?.message || "Unknown error",
            variant: "destructive",
          });
        },
      });
    } catch (err: any) {
      toast({
        title: "Failed to create question",
        description:
          err?.response?.data?.message || err?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Create New Question</DialogTitle>
          <div className="flex items-center justify-between w-full">
            <DialogDescription className="text-xs">
              Fill in the details below to add a new question. Use the copy button to duplicate content from current language to the other.
            </DialogDescription>
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={lang === "en" ? "default" : "outline"}
                  onClick={() => setLang("en")}
                  className="px-2 py-1 h-7"
                >
                  EN
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={lang === "hi" ? "default" : "outline"}
                  onClick={() => setLang("hi")}
                  className="px-2 py-1 h-7"
                >
                  HI
                </Button>
              </div>

              {/* Copy button */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyFromCurrentLanguage}
                disabled={!canCopyFromCurrent()}
                className="px-2 py-1 h-7 text-xs"
                title={`Copy from ${lang === "en" ? "English" : "Hindi"} to ${lang === "en" ? "Hindi" : "English"}`}
              >
                Copy {lang === "en" ? "EN→HI" : "HI→EN"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Selectors Section - Commented out for future use */}
          {/* <div className="space-y-2">
            <Label className="text-xs">Exam</Label>
            <ExamSelector
              multiple={false}
              value={exams}
              onChange={setExams}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Subject</Label>
            <SubjectSelector
              value={subjects}
              onChange={setSubjects}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Category</Label>
            <CategorySelector
              value={category}
              onChange={setCategory}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Topic</Label>
            <TopicSelector
              value={topics}
              onChange={setTopics}
            />
          </div> */}

          {/* Question Scoring - Hidden from user but sent to DB */}
          <div className="hidden">
            <Input
              type="number"
              min={0}
              value={marks}
              onChange={() => {}}
              className="text-xs"
            />
            <Input
              type="number"
              min={0}
              step={0.01}
              value={negativeMarks}
              onChange={() => {}}
              className="text-xs"
            />
          </div>

          <div className="mb-2">
            <Label className="text-xs">Question Type</Label>
            <div className="flex flex-row gap-2 mt-1">

            </div>
            <RadioGroup
              value={questionType}
              onValueChange={(val) => {
                const newType = val as "single_choice" | "multiple_choice";
                setQuestionType(newType);
                if (newType === "single_choice") {
                  // Reset all correct options if switching to single choice
                  setOptions(prev => prev.map(opt => ({
                    ...opt,
                    isCorrectEN: false,
                    isCorrectHI: false
                  })));
                }
              }}
              className="flex flex-row gap-2 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="single_choice" id="single_choice" />
                <Label htmlFor="single_choice" className="text-xs">
                  Single
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                <Label htmlFor="multiple_choice" className="text-xs">
                  Multiple
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {lang === "en" ? (
              <div>
                <Label className="text-xs">Question (English)</Label>
                <Textarea
                  value={textEN}
                  onChange={(e) => setTextEN(e.target.value)}
                  required
                  className="text-xs min-h-[48px]"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Question (Hindi)</Label>
                <Textarea
                  value={textHI}
                  onChange={(e) => setTextHI(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
              </div>
            )}
          </div>
          <div className="mb-2">
            <Label className="text-xs">Image (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs"
            />
            {imageFile && (
              <div className="mt-1 flex items-center gap-2">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="h-12 w-12 object-contain border rounded"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs">Options</Label>
            <div className="space-y-2 pr-1">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center text-xs">
                  <Input
                    placeholder={
                      lang === "en"
                        ? `Option ${i + 1} (EN)`
                        : `Option ${i + 1} (HI)`
                    }
                    value={lang === "en" ? opt.en : opt.hi}
                    onChange={(e) =>
                      handleOptionChange(i, lang, e.target.value)
                    }
                    required={lang === "en"}
                    className="w-40 px-2 py-1"
                  />
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={
                        lang === "en" ? opt.isCorrectEN : opt.isCorrectHI
                      }
                      onCheckedChange={(checked) =>
                        handleCorrectChange(
                          i,
                          lang === "en" ? "isCorrectEN" : "isCorrectHI",
                          checked === true
                        )
                      }
                      disabled={
                        questionType === "single_choice" &&
                        ((lang === "en" && opt.isCorrectEN) ||
                          (lang === "hi" && opt.isCorrectHI)) &&
                        options.filter((o) =>
                          lang === "en" ? o.isCorrectEN : o.isCorrectHI
                        ).length === 1
                      }
                    />
                    <span>{lang.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {lang === "en" ? (
              <>
                <Label className="text-xs">Solution (English)</Label>
                <Textarea
                  value={solutionEN}
                  onChange={(e) => setSolutionEN(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
              </>
            ) : (
              <>
                <Label className="text-xs">Solution (Hindi)</Label>
                <Textarea
                  value={solutionHI}
                  onChange={(e) => setSolutionHI(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
              </>
            )}
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={createQuestion.isPending || !isFormValidForSubmission()}
            >
              Create Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
