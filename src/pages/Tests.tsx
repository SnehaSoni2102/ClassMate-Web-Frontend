
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  BookOpen,
  Trophy,
  Search,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const Tests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  const availableTests = [
    {
      id: '1',
      title: 'JEE Advanced Physics Mock Test #16',
      group: 'JEE Advanced 2024',
      duration: '3 hours',
      difficulty: 'Hard',
      questions: 60,
      deadline: '2 days left',
      participants: 28,
      category: 'Physics'
    },
    {
      id: '2',
      title: 'NEET Biology Classification Quiz',
      group: 'NEET Biology Masters',
      duration: '1.5 hours',
      difficulty: 'Medium',
      questions: 40,
      deadline: '5 days left',
      participants: 22,
      category: 'Biology'
    }
  ];

  const completedTests = [
    {
      id: '3',
      title: 'Mathematics Advanced Calculus',
      group: 'JEE Advanced 2024',
      score: '85%',
      rank: 3,
      totalParticipants: 18,
      date: '2024-12-10',
      category: 'Mathematics',
      duration: '2 hours'
    },
    {
      id: '4',
      title: 'Physics Mechanics & Waves',
      group: 'Class 12 Physics',
      score: '92%',
      rank: 1,
      totalParticipants: 20,
      date: '2024-12-08',
      category: 'Physics',
      duration: '2.5 hours'
    },
    {
      id: '5',
      title: 'Chemistry Organic Compounds',
      group: 'NEET Biology Masters',
      score: '78%',
      rank: 8,
      totalParticipants: 22,
      date: '2024-12-05',
      category: 'Chemistry',
      duration: '2 hours'
    }
  ];

  const myCreatedTests = [
    {
      id: '6',
      title: 'Algebra Practice Set #5',
      group: 'Mathematics Study Circle',
      status: 'Active',
      participants: 15,
      avgScore: '82%',
      created: '2024-12-12',
      visibility: 'Hidden until results'
    },
    {
      id: '7',
      title: 'Trigonometry Mock Test',
      group: 'Mathematics Study Circle',
      status: 'Draft',
      participants: 0,
      avgScore: '-',
      created: '2024-12-13',
      visibility: 'Draft'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Physics': 'bg-brand-primary',
      'Mathematics': 'bg-brand-yellow',
      'Chemistry': 'bg-brand-pink',
      'Biology': 'bg-brand-purple'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'Completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tests & Assessments</h1>
          <p className="text-gray-600 mt-2">
            Take tests, view results, and track your progress across all subjects
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-brand-primary" size={20} />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-gray-600">Available Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-brand-yellow" size={20} />
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-brand-pink" size={20} />
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-gray-600">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-brand-purple" size={20} />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-gray-600">Tests Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Tests ({availableTests.length})</TabsTrigger>
            <TabsTrigger value="completed">My Results ({completedTests.length})</TabsTrigger>
            <TabsTrigger value="created">Created by Me ({myCreatedTests.length})</TabsTrigger>
          </TabsList>

          {/* Available Tests */}
          <TabsContent value="available" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {availableTests.map((test) => (
                <Card key={test.id} className="card-hover border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(test.category)}`}></div>
                          <span className="text-xs font-medium text-gray-600">{test.category}</span>
                          <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{test.group}</p>
                      </div>
                      <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} className="text-gray-500" />
                          <span>{test.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen size={14} className="text-gray-500" />
                          <span>{test.questions} questions</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{test.participants} taking this test</span>
                        <span className="font-medium text-orange-600">{test.deadline}</span>
                      </div>

                      <Button className="w-full button-gradient text-white">
                        <Play className="mr-2" size={16} />
                        Start Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Completed Tests */}
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedTests.map((test) => (
                <Card key={test.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(test.category)}`}></div>
                          <span className="text-sm font-medium text-gray-600">{test.category}</span>
                          <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{test.title}</h3>
                        <p className="text-sm text-gray-600">{test.group} • {test.duration}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{test.score}</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">#{test.rank}</p>
                            <p className="text-xs text-gray-500">Rank</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-medium text-gray-700">{test.totalParticipants}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{test.date}</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Created Tests */}
          <TabsContent value="created" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tests Created by You</CardTitle>
                  <Link to="/tests/create-test">
                    <Button className="button-gradient text-white">
                      <BookOpen className="mr-2" size={16} />
                      Create New Test
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-600">Manage tests you've created for your groups</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCreatedTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{test.title}</h3>
                        <p className="text-sm text-gray-600">{test.group}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(test.status)}
                          <span className="text-sm text-gray-600">{test.participants} participants</span>
                          <span className="text-sm text-gray-600">Avg: {test.avgScore}</span>
                          <Badge variant="outline" className="text-xs">{test.visibility}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{test.created}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Results</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tests;
