import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, FileText, CheckCircle, XCircle, BookOpen, Timer, Award, Target, AlertCircle, Download } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { GroupService } from '@/services/group.service';
import { useUpdateTestStatus } from '@/lib/api/mutations/update-test-status-mutation';
import { useGetSingleTest } from '@/lib/api/queries/use-get-single-test';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import logo from '@/../public/icons/logo.svg';
import { MathJaxProvider } from '@/components/providers/MathJaxProvider';
import { MathText } from '@/components/shared/MathText';

interface Question {
  _id: string;
  question: string;
  image?: string;
  question_hi: string;
  options: string[];
  options_hi: string[];
  correctAnswers: string[];
  correctAnswers_hi: string[];
  positiveMarking: number;
  negativeMarking: number;
  multipleSelection: boolean;
}

interface Section {
  _id: string;
  name: string;
  name_hi: string;
  order: number;
  timeLimit: number;
  questions: Question[];
}

interface Exam {
  _id: string;
  name: string;
  logo: string;
  name_hi: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TestData {
  _id: string;
  title: string;
  title_hi: string;
  totalQuestions: number;
  totalSections: number;
  durationInMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  description: string;
  description_hi: string;
  languageOptions: string[];
  type: string;
  status: string;
  exam: Exam;
  sections: Section[];
}

const TestPreview = () => {
  const { testId, groupId } = useParams<{ testId: string, groupId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  // Use the mutation hook and query hooks
  const updateStatus = useUpdateTestStatus();
  const { data: globalTestData, isLoading: isGlobalTestLoading, error: globalTestError } = useGetSingleTest(testId || '');

  // PDF download state
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const loadTestData = useCallback(async () => {
    if (!testId) {
      setError("Test ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get test data from API
      let response;
      if (groupId) {
        // Group test
        response = await GroupService.getGroupTest(groupId, testId);
      } else {
        // Global test - use the query hook
        if (globalTestData?.success) {
          setTestData(globalTestData.data as TestData);
          setIsLoading(false);
          return;
        } else if (globalTestError) {
          throw new Error(globalTestError.message || 'Failed to load global test');
        } else {
          // Still loading
          return;
        }
      }

      if (response.success) {
        setTestData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load test');
      }
    } catch (error: any) {
      console.error('Load test error:', error);
      setError(error.message || "Failed to load test details");
    } finally {
      setIsLoading(false);
    }
  }, [testId, groupId, globalTestData, globalTestError]);

  useEffect(() => {
    loadTestData();
  }, [loadTestData]);

  const handlePublishTest = () => {
    if (!testData || testData.status !== 'in-progress') return;

    updateStatus.mutate({
      testId: testData._id,
      status: { status: 'published' }
    }, {
      onSuccess: (response) => {
        console.log('Test published successfully:', response);
        window.location.reload();
        // The mutation will automatically invalidate queries, so the data will refresh
      },
      onError: (error: any) => {
        console.error('Publish test error:', error);
      }
    });
  };

  const formatDuration = (durationInSeconds: number) => {
    const minutes = durationInSeconds / 60; // Convert seconds to minutes for display
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${Math.floor(minutes)}m`;
  };

  // PDF Download Function - Creates exam paper style PDF
  const downloadTestAsPDF = async () => {
    if (!testData) return;

    setIsDownloadingPDF(true);

    try {
      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your exam paper PDF...",
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20; // Start from top with margin
      const margin = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Approximate height
      };

      // Title and Header
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const titleText = selectedLanguage === 'hi' ? testData.title_hi : testData.title;
      pdf.text(titleText, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Exam info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const examInfo = `Exam: ${testData.exam.name} | Duration: ${formatDuration(testData.durationInMinutes)} | Total Marks: ${testData.totalMarks}`;
      currentY += addWrappedText(examInfo, margin, currentY, pageWidth - 2 * margin, 10) + 5;

      // Instructions
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSTRUCTIONS:', margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const instructions = [
        `• Total Questions: ${testData.totalQuestions}`,
        `• Total Sections: ${testData.totalSections}`,
        `• Marks per Question: ${testData.marksPerQuestion}`,
        ...(testData.negativeMarks > 0 ? [`• Negative Marks: ${testData.negativeMarks}`] : []),
        '• Choose the correct answer for each question',
        '• Multiple choice questions may have one or more correct answers'
      ];

      instructions.forEach(instruction => {
        checkPageBreak(6);
        currentY += addWrappedText(`• ${instruction}`, margin + 5, currentY, pageWidth - 2 * margin - 10, 9) + 3;
      });

      currentY += 10;

      // Process each section
      testData.sections.forEach((section, sectionIndex) => {
        checkPageBreak(15);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const sectionTitle = `SECTION ${sectionIndex + 1}: ${selectedLanguage === 'hi' ? section.name_hi : section.name}`;
        pdf.text(sectionTitle, margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Time Limit: ${section.timeLimit} minutes | Questions: ${section.questions.length}`, margin, currentY);
        currentY += 15;

        // Process each question in the section
        section.questions.forEach((question, questionIndex) => {
          const questionNumber = sectionIndex + 1;
          const questionText = selectedLanguage === 'hi' ? question.question_hi : question.question;
          const options = selectedLanguage === 'hi' ? question.options_hi : question.options;
          const correctAnswers = selectedLanguage === 'hi' ? question.correctAnswers_hi : question.correctAnswers;

          // Question header
          checkPageBreak(20);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Q${questionNumber}.${questionIndex + 1}`, margin, currentY);
          currentY += 8;

          // Question text
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const questionHeight = addWrappedText(questionText, margin + 10, currentY, pageWidth - margin * 2 - 10);
          currentY += questionHeight + 5;

          // Options
          if (options && options.length > 0) {
            options.forEach((option, optionIndex) => {
              checkPageBreak(8);
              const optionLetter = String.fromCharCode(65 + optionIndex);
              const isCorrect = correctAnswers && correctAnswers.includes(option);

              pdf.setFontSize(10);
              pdf.setFont('helvetica', isCorrect ? 'bold' : 'normal');

              // Option letter and text
              pdf.text(`${optionLetter}.`, margin + 10, currentY);
              currentY += addWrappedText(option, margin + 25, currentY, pageWidth - margin * 2 - 25);
              currentY += 3;
            });
          }

          // Correct answer indicator
          if (correctAnswers && correctAnswers.length > 0) {
            checkPageBreak(8);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Correct Answer(s): ${correctAnswers.join(', ')}`, margin + 10, currentY);
            currentY += 8;
          }

          // Question marks
          checkPageBreak(6);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const marksText = `Marks: +${testData.marksPerQuestion}${testData.negativeMarks > 0 ? `, -${testData.negativeMarks}` : ''}`;
          pdf.text(marksText, pageWidth - margin - 40, currentY);
          currentY += 12;
        });
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
      }

      // Download the PDF
      const fileName = `${selectedLanguage === 'hi' ? testData.title_hi : testData.title}_Exam_Paper.pdf`;
      pdf.save(fileName);

      // Show success toast
      toast({
        title: "PDF Downloaded",
        description: `Exam paper has been downloaded as ${fileName}`,
      });

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

 const handleDownloadPDF = () => {
    const element = document.getElementById('test-paper');

    html2pdf().set({
      margin: 1,
      filename: `${(selectedLanguage === 'hi' ? testData.title_hi : testData.title)?.replace(/\s+/g, '_')}.pdf`,
      image: { quality: 0.98, type: 'jpeg' },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading || (groupId ? false : isGlobalTestLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading test preview..." />
      </div>
    );
  }

  // Error state
  if (error || (!groupId && globalTestError) || !testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Test
          </h3>
          <p className="text-gray-600 mb-4">{error || globalTestError?.message || "Test not found"}</p>
          <Button
            onClick={() => {
              if (groupId) {
                navigate(`/groups/${groupId}?tab=tests`);
              } else {
                navigate('/tests');
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
    <MathJaxProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="test-preview-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (groupId) {
                  // For group tests, go to group tests tab
                  navigate(`/groups/${groupId}?tab=tests`);
                } else {
                  // For global tests, go back to tests list
                  navigate('/tests');
                }
              }}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
           
            <div className='flex items-center space-x-2 justify-end'>
              <Button
                variant="outline"
                onClick={() => {
                  if (groupId) {
                    navigate(`/groups/${groupId}/edit-test/${testId}`);
                  } else {
                    navigate(`/tests/edit-test/${testId}`);
                  }
                }}
              >
                Edit Test
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="flex items-center space-x-2"
              >
                {isDownloadingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Exam Paper</span>
                  </>
                )}
              </Button>

              {testData.status === 'in-progress' && (
                <div className="flex flex-col items-end space-y-2">
                  {updateStatus.error && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded border border-red-200">
                      {updateStatus.error.message || 'Failed to publish test'}
                    </div>
                  )}
                  <Button
                    onClick={handlePublishTest}
                    disabled={updateStatus.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updateStatus.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2" size={16} />
                        Publish Test
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

          </div>

          {/* Test Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {testData.exam.logo && (
                    <img
                      src={testData.exam.logo}
                      alt="Exam Logo"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedLanguage === 'hi' ? testData.title_hi : testData.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {selectedLanguage === 'hi' ? testData.description_hi : testData.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <BookOpen size={14} />
                        <span>{testData.exam.name}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <FileText size={14} />
                        <span>{testData.type}</span>
                      </span>
                      <span>•</span>
                      {getStatusBadge(testData.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Test Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{testData.totalQuestions}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{formatDuration(testData.durationInMinutes)}</p>
              <p className="text-sm text-gray-600">Duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="text-yellow-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{testData.totalMarks}</p>
              <p className="text-sm text-gray-600">Total Marks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="text-purple-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{testData.totalSections}</p>
              <p className="text-sm text-gray-600">Sections</p>
            </CardContent>
          </Card>
        </div>

        {/* Language Toggle */}
        {testData.languageOptions.length > 1 && (
          <div className="flex justify-center mb-6">
            <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'en' | 'hi')}>
              <TabsList>
                {testData.languageOptions.map((lang) => (
                  <TabsTrigger key={lang} value={lang === 'English' ? 'en' : 'hi'}>
                    {lang}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Test Content */}
        <div id="test-paper" className="space-y-6">
          {testData.sections.map((section, sectionIndex) => (
            <Card key={section._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Section {sectionIndex + 1}: {selectedLanguage === 'hi' ? section.name_hi : section.name}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Timer size={16} />
                    <span>{section.timeLimit} min</span>
                    <span>•</span>
                    <span>{section.questions.length} questions</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={question._id} className="border rounded-lg p-4 relative overflow-hidden">
                    {/* Watermark */}
                    <div className="absolute z-10 inset-0 pointer-events-none select-none opacity-50 flex items-center justify-center transform rotate-12 scale-150">
                      <div className="flex flex-col items-center space-y-2">
                        <img src={logo} alt="Classmate Test Logo" className="w-16 h-16" />
                        <span className="text-2xl font-bold text-gray-400">Classmate Test</span>
                      </div>
                    </div>

                    <div className="relative z-[1]">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex-1">
                          <div className="flex flex-wrap gap-1">
                            <span>{`Q${sectionIndex + 1}.${questionIndex + 1}${question.serial_no ? ` (#${question.serial_no})` : ''}: `}</span>
                            <MathText text={selectedLanguage === 'hi' ? question.question_hi : question.question} />
                          </div>
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>+{testData.marksPerQuestion}</span>
                          {testData.negativeMarks > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-600">-{testData.negativeMarks}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {question.image && (
                        <div className="flex justify-center mb-4">
                          <img src={question.image} alt="Question" className="max-h-64 object-contain rounded" />
                        </div>
                      )}

                      <div className="space-y-2 mb-4 relative z-[1]">
                        {(selectedLanguage === 'hi' ? question.options_hi : question.options).map((option, optionIndex) => {
                          const isCorrect = (selectedLanguage === 'hi' ? question.correctAnswers_hi : question.correctAnswers).includes(option);
                          return (
                            <div
                              key={optionIndex}
                              className={`flex items-center space-x-3 p-2 rounded border ${
                                isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCorrect ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <MathText 
                                className="flex-1" 
                                text={option} 
                              />
                              {isCorrect && (
                                <CheckCircle className="text-green-600" size={16} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {question.multipleSelection && (
                        <Badge variant="outline" className="text-xs">
                          Multiple Selection Allowed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </MathJaxProvider>
  );
};

export default TestPreview;
