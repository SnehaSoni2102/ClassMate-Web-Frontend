
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import {
  Calendar,
  Users,
  BookOpen,
  Clock,
  AlertCircle
} from 'lucide-react';

// Define types for dashboard summary
interface DashboardSummary {
  testsAtempted: number;
  testsCreated: number;
  groupsJoined: number;
  groupsCreated: number;
  upcomingLiveTests: {
    examLogo: string;
    name: string;
    totalMarks: number;
    totalQuestions: number;
    duration: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<DashboardSummary>('/users/dashboard-summary');
        setDashboardData(response.data);
      } catch (error: any) {
        console.error('Dashboard load error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user) return null;

  const stats = [
    {
      title: 'Tests Attempted',
      value: dashboardData?.testsAtempted || 0,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Tests Created',
      value: dashboardData?.testsCreated || 0,
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Groups Joined',
      value: dashboardData?.groupsJoined || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Groups Created',
      value: dashboardData?.groupsCreated || 0,
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || `User ${user.phoneNumber}`}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your study overview
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading dashboard..." />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && dashboardData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="text-white" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upcoming Tests */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="text-blue-500" size={20} />
                      <span>Upcoming Live Tests</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.upcomingLiveTests.length > 0 ? (
                        dashboardData.upcomingLiveTests.map((test, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                            {test.examLogo && (
                              <img 
                                src={test.examLogo} 
                                alt="Exam Logo" 
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{test.name}</h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>{test.totalQuestions} questions</span>
                                <span>{test.totalMarks} marks</span>
                                {test?.duration && <span>{(test?.duration/60)} mins</span>}
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>Start: {new Date(test.startDate).toLocaleDateString()} {test.startTime}</span>
                                <span>End: {new Date(test.endDate).toLocaleDateString()} {test.endTime}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="mx-auto mb-2" size={32} />
                          <p>No upcoming live tests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Link to="/groups">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="mr-2" size={16} />
                        Browse Groups
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
