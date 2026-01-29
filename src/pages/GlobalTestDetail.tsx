import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, FileText, AlertCircle, Plus, Loader2, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useGetSingleTest } from '@/lib/api/queries/use-get-single-test';
import { useAddTestToGroup } from '@/lib/api/mutations/add-test-to-group';

interface Question {
  _id: string;
  question: string;
  question_hi: string;
  options: string[];
  options_hi: string[];
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

const GlobalTestDetail = () => {
  const { groupId, testId } = useParams<{ groupId: string; testId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSingleTest(testId || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  const testData: TestData | null = data?.success ? (data.data as TestData) : null;

  // Use the mutation hook
  const addToGroup = useAddTestToGroup();

  const handleAddToGroup = () => {
    if (!groupId || !testId || !testData) return;

    addToGroup.mutate({
      groupId,
      testId
    }, {
      onSuccess: (response) => {
        console.log('Test added to group successfully:', response);
        // Navigate back after a short delay
        setTimeout(() => {
          navigate(`/groups/${groupId}`);
        }, 2000);
      },
      onError: (error: any) => {
        console.error('Add to group error:', error);
      }
    });
  };

  const formatDuration = (durationInSeconds: number) => {
    const minutes = durationInSeconds / 60; // Convert seconds to minutes
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${Math.floor(minutes)}m`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading test details..." />
      </div>
    );
  }

  // Error state
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Test
          </h3>
          <p className="text-gray-600 mb-4">{error?.message || data?.message || "Test not found"}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Back to Tests</span>
            </Button>

            {!addToGroup.isSuccess && (
              <Button
                onClick={handleAddToGroup}
                disabled={addToGroup.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addToGroup.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Adding to Group...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Add to Group
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Message */}
          {addToGroup.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-green-800 font-medium">
                  Test successfully added to group! Redirecting...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {addToGroup.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-red-800 font-medium">
                  {addToGroup.error.message || 'Failed to add test to group'}
                </span>
              </div>
            </div>
          )}

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
                        <FileText size={14} />
                        <span>{testData.exam.name}</span>
                      </span>
                      <span>•</span>
                      <span>{testData.type}</span>
                      <span>•</span>
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
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
              <div className="text-yellow-500 mx-auto mb-2 text-2xl font-bold">
                {testData.totalMarks}
              </div>
              <p className="text-sm text-gray-600">Total Marks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-purple-500 mx-auto mb-2 text-2xl font-bold">
                {testData.totalSections}
              </div>
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

        {/* Test Content - Question Paper Format */}
        <div className="space-y-6">
          {testData.sections.map((section, sectionIndex) => (
            <Card key={section._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Section {sectionIndex + 1}: {selectedLanguage === 'hi' ? section.name_hi : section.name}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{section.timeLimit} min</span>
                    <span>•</span>
                    <span>{section.questions.length} questions</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={question._id} className="border rounded-lg p-4 bg-white">
                    <div className="mb-4">
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Q{sectionIndex + 1}.{questionIndex + 1}: {selectedLanguage === 'hi' ? question.question_hi : question.question}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {(selectedLanguage === 'hi' ? question.options_hi : question.options).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-start space-x-3 p-2 rounded border bg-gray-50"
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <span className="flex-1 text-gray-800">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalTestDetail;
