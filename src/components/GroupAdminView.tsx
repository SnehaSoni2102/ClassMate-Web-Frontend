
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Shield, 
  Calendar,
  BookOpen,
  Settings,
  UserPlus,
  UserMinus,
  MoreVertical,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

interface GroupData {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPublic: boolean;
  createdDate: string;
  userRole: 'admin' | 'manager' | 'member';
}

interface GroupAdminViewProps {
  groupData: GroupData;
}

const GroupAdminView: React.FC<GroupAdminViewProps> = ({ groupData }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const members = [
    { id: '1', name: 'Rahul Kumar', role: 'admin', avatar: 'RK', lastActive: '2 mins ago', testsCompleted: 15 },
    { id: '2', name: 'Priya Sharma', role: 'manager', avatar: 'PS', lastActive: '1 hour ago', testsCompleted: 12 },
    { id: '3', name: 'Amit Singh', role: 'manager', avatar: 'AS', lastActive: '3 hours ago', testsCompleted: 18 },
    { id: '4', name: 'Neha Gupta', role: 'member', avatar: 'NG', lastActive: '5 hours ago', testsCompleted: 8 },
    { id: '5', name: 'Vikash Yadav', role: 'member', avatar: 'VY', lastActive: '1 day ago', testsCompleted: 10 },
  ];

  const tests = [
    { id: '1', title: 'Physics Mock Test #15', status: 'completed', participants: 22, avgScore: '78%', createdBy: 'Admin', date: '2024-12-14' },
    { id: '2', title: 'Mathematics Practice Set', status: 'active', participants: 18, avgScore: '-', createdBy: 'Manager', date: '2024-12-13' },
    { id: '3', title: 'Chemistry Quiz', status: 'scheduled', participants: 0, avgScore: '-', createdBy: 'Admin', date: '2024-12-16' },
  ];

  const joinRequests = [
    { id: '1', name: 'Ravi Kumar', requestDate: '2 hours ago', testsCompleted: 25, reason: 'Preparing for JEE Advanced 2024' },
    { id: '2', name: 'Sanjana Patel', requestDate: '5 hours ago', testsCompleted: 18, reason: 'Looking for study group' },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="text-yellow-500" size={16} />;
      case 'manager':
        return <Shield className="text-blue-500" size={16} />;
      default:
        return <Users className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-brand-primary" size={20} />
              <div>
                <p className="text-2xl font-bold">{groupData.memberCount}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-brand-yellow" size={20} />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Active Tests</p>
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
              <Clock className="text-brand-purple" size={20} />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">Join Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="requests">Requests ({joinRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">Physics Mock Test completed</p>
                      <p className="text-sm text-gray-600">22 participants • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserPlus className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">3 new members joined</p>
                      <p className="text-sm text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="text-purple-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">Group reached 25+ members</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start button-gradient text-white">
                  <BookOpen className="mr-2" size={16} />
                  Create New Test
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="mr-2" size={16} />
                  Invite Members
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2" size={16} />
                  Group Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2" size={16} />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Members</CardTitle>
                <Button className="button-gradient text-white">
                  <UserPlus className="mr-2" size={16} />
                  Invite Members
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{member.testsCompleted} tests</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{member.lastActive}</span>
                      {member.role !== 'admin' && (
                        <div className="flex space-x-1">
                          {member.role === 'member' && (
                            <Button size="sm" variant="outline">Promote</Button>
                          )}
                          {member.role === 'manager' && (
                            <Button size="sm" variant="outline">Demote</Button>
                          )}
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Tests</CardTitle>
                <Button className="button-gradient text-white">
                  <BookOpen className="mr-2" size={16} />
                  Create Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{test.title}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        {getStatusBadge(test.status)}
                        <span className="text-sm text-gray-600">{test.participants} participants</span>
                        <span className="text-sm text-gray-600">Avg: {test.avgScore}</span>
                        <span className="text-sm text-gray-600">By: {test.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{test.date}</span>
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Join Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">{request.testsCompleted} tests completed</span>
                        <span className="text-sm text-gray-500">Requested {request.requestDate}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupAdminView;
