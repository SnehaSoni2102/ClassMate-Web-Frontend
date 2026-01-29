import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calendar,
  Clock,
  BookOpen,
  Trophy
} from 'lucide-react';

interface GroupMemberViewProps {
  groupId: string;
}

const GroupMemberView: React.FC<GroupMemberViewProps> = ({ groupId }) => {
  // Mock data for group details
  const groupDetails = {
    name: 'JEE Advanced 2024',
    description: 'A study group for students preparing for the JEE Advanced exam in 2024.',
    members: 35,
    testsAvailable: 5,
    testsCompleted: 12,
    averageScore: '78%',
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{groupDetails.name}</CardTitle>
          <Badge variant="secondary">Member</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{groupDetails.description}</p>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-row items-center justify-between space-x-4 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Members</p>
                  <div className="text-2xl font-bold">{groupDetails.members}</div>
                </div>
                <Users className="h-8 w-8 text-gray-700" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center justify-between space-x-4 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Available Tests</p>
                  <div className="text-2xl font-bold">{groupDetails.testsAvailable}</div>
                </div>
                <Calendar className="h-8 w-8 text-gray-700" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center justify-between space-x-4 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tests Completed</p>
                  <div className="text-2xl font-bold">{groupDetails.testsCompleted}</div>
                </div>
                <BookOpen className="h-8 w-8 text-gray-700" />
              </CardContent>
            </Card>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm">Average Score: {groupDetails.averageScore}</p>
                </div>
                <Button variant="outline" className="mt-4">View Detailed Progress</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <p className="text-sm">Next test on December 25, 2024</p>
                </div>
                <Button variant="outline" className="mt-4">View Test Details</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupMemberView;
