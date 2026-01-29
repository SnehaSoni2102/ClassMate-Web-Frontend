import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Settings, 
  Plus, 
  MoreVertical,
  Calendar,
  Clock,
  BookOpen,
  Trophy
} from 'lucide-react';

const GroupManagerView = () => {
  const groupDetails = {
    name: 'JEE Advanced 2024',
    description: 'A focused group for students preparing for the JEE Advanced exam in 2024.',
    members: 45,
    tests: 12,
    averageScore: '88%',
    admin: 'Priya Sharma',
    createdOn: '2023-11-20'
  };

  const upcomingTests = [
    {
      id: '101',
      title: 'Physics Mock Test #7',
      date: '2024-12-28',
      time: '14:00',
      duration: '3 hours',
      participants: 32
    },
    {
      id: '102',
      title: 'Chemistry - Organic Compounds',
      date: '2024-12-30',
      time: '10:00',
      duration: '2.5 hours',
      participants: 28
    }
  ];

  const groupMembers = [
    { id: '1', name: 'Rahul Kumar', progress: 78 },
    { id: '2', name: 'Anjali Reddy', progress: 92 },
    { id: '3', name: 'Vikram Singh', progress: 65 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Group Details */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{groupDetails.name}</CardTitle>
            <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {groupDetails.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{groupDetails.members} Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span>{groupDetails.tests} Tests</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-gray-500" />
              <span>Avg. Score: {groupDetails.averageScore}</span>
            </div>
            <Separator />
            <div className="text-sm text-gray-500">
              Admin: {groupDetails.admin}
            </div>
            <div className="text-sm text-gray-500">
              Created On: {groupDetails.createdOn}
            </div>
            <Button className="w-full mt-4 button-gradient text-white">
              <Settings className="mr-2 h-4 w-4" />
              Manage Group
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tests */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Tests</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Test
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Prepare and schedule tests for the group
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold">{test.title}</h3>
                  <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{test.date}</span>
                  <Clock className="h-4 w-4" />
                  <span>{test.time}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-500">
                    Duration: {test.duration}
                  </div>
                  <div className="text-sm text-gray-500">
                    Participants: {test.participants}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Members */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Group Members</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track members' progress and manage roles
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="text-md font-semibold">{member.name}</h3>
                  <div className="text-sm text-gray-500">
                    Progress: {member.progress}%
                  </div>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagerView;
