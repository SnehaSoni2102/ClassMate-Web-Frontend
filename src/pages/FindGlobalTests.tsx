import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText, BookOpen, AlertCircle, Search, Target, Award } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useGetAllTests } from '@/lib/api/queries/use-get-all-tests';

interface Test {
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
  testType: string;
  exam: {
    _id: string;
    name: string;
    logo: string;
    name_hi: string;
  };
  sections: any[];
  attemptedUsers: string[];
  isAllIndia: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

interface TestsByExam {
  [examName: string]: Test[];
}

const FindGlobalTests = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllTests();

  // Process the data to filter published tests
  const testsData: TestsByExam | null = data?.success ? (() => {
    const filteredTests: TestsByExam = {};
    Object.keys(data.data).forEach(examName => {
      filteredTests[examName] = data.data[examName].filter((test: Test) => test.status === 'published');
    });
    return filteredTests;
  })() : null;

  const formatDuration = (durationInSeconds: number) => {
    const minutes = durationInSeconds / 60; // Convert seconds to minutes
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${Math.floor(minutes)}m`;
  };

  const getTotalTestsCount = () => {
    if (!testsData) return 0;
    return Object.values(testsData).reduce((total, tests) => total + tests.length, 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading global tests..." />
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
            Error Loading Tests
          </h3>
          <p className="text-gray-600 mb-4">{error?.message || data?.message || "Failed to load tests"}</p>
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
              <span>Back to Group</span>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Find & Add Global Tests</h1>
            <p className="text-gray-600 mt-2">
              Browse published tests from different exams and add them to your group
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Found {getTotalTestsCount()} published tests
            </p>
          </div>
        </div>

        {/* Tests by Exam */}
        <div className="space-y-8">
          {Object.entries(testsData).map(([examName, tests]) => (
            <div key={examName}>
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{examName}</h2>
                <Badge variant="secondary" className="text-sm">
                  {tests.length} test{tests.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {tests.map((test) => (
                  <Card key={test._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {test?.exam?.logo && (
                            <img
                              src={test?.exam?.logo}
                              alt="Exam Logo"
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {test.type}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Published
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <FileText size={14} className="text-gray-500" />
                            <span>{test.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target size={14} className="text-gray-500" />
                            <span>{test.totalSections} sections</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} className="text-gray-500" />
                            <span>{formatDuration(test.durationInMinutes)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award size={14} className="text-gray-500" />
                            <span>{test.totalMarks} marks</span>
                          </div>
                        </div>

                        {test.languageOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {test.languageOptions.map((lang, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/groups/${groupId}/find-all-test-for-addition/${test._id}`}
                            className="flex-1"
                          >
                            <Button variant="outline" className="w-full">
                              <BookOpen className="mr-2" size={16} />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {getTotalTestsCount() === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Published Tests Found
            </h3>
            <p className="text-gray-600">
              There are no published tests available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindGlobalTests;
