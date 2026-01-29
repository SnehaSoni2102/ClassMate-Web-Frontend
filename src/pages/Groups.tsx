import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { GroupService } from '@/services/group.service';
import { UserService } from '@/services/user.service';
import { Group, GroupApiResponse } from '@/types/group';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CreateGroupModal from '@/components/CreateGroupModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Search,
  Plus,
  Crown,
  Shield,
  User,
  Calendar,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');
  const [createdGroups, setCreatedGroups] = useState<GroupApiResponse[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<GroupApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  // Helper function to get user role from group members
  const getUserRoleFromGroup = (group: GroupApiResponse): string => {
    if (!user?._id) return 'member';

    const member = group.members.find(m => {
      if (typeof m.user === 'string') {
        return m.user === user._id;
      }
      return m.user?._id === user._id;
    });

    return member?.role || 'member';
  };

  // Helper function to get member count
  const getMemberCount = (group: GroupApiResponse): number => {
    return group.members.length;
  };

  // Load groups created by the user
  const loadCreatedGroups = async () => {
    try {
      const response = await UserService.getUserGroups();
      console.log({ createdGroupsResponse: response });
      setCreatedGroups(response);
    } catch (error: any) {
      console.error('Load created groups error:', error);
      setError('Failed to load your created groups');
    }
  };

  // Load groups the user has joined
  const loadJoinedGroups = async () => {
    try {
      const response = await GroupService.getGroups();
      console.log({ joinedGroupsResponse: response });
      setJoinedGroups(response);
    } catch (error: any) {
      console.error('Load joined groups error:', error);
      setError('Failed to load your joined groups');
    }
  };



  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([loadCreatedGroups(), loadJoinedGroups()]);
      } catch (error) {
        console.error('Initial load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'group-admin':
        return <Crown className="text-yellow-500" size={16} />;
      case 'group-manager':
        return <Shield className="text-blue-500" size={16} />;
      default:
        return <User className="text-gray-500" size={16} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'group-admin':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Admin</Badge>
        );
      case 'group-manager':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>
        );
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const getCategoryColor = (createdBy: string) => {
    const colors = {
      TEACHER: 'bg-brand-primary',
      STUDENT: 'bg-brand-pink',
    };
    return colors[createdBy as keyof typeof colors] || 'bg-gray-500';
  };

  const filteredGroups = useMemo(() => {
    const groups = activeTab === 'created' ? createdGroups : joinedGroups;
    
    return groups.filter((group) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        group.title.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower)
      );
    });
  }, [activeTab, createdGroups, joinedGroups, searchTerm]);

  const handleCreateGroupSuccess = () => {
    // Refresh the created groups list
    loadCreatedGroups();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
            <p className="text-gray-600 mt-2">
              Join or manage study groups to collaborate with peers
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0 button-gradient text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2" size={16} />
            Create Group
          </Button>
        </div>

        {/* Tabs and Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('created')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'created'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Groups Created ({createdGroups.length})
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'joined'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Groups Joined ({joinedGroups.length})
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading groups..." />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Groups</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Groups Grid */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const userRole = getUserRoleFromGroup(group);
              const memberCount = getMemberCount(group);
              
              return (
                <Card key={group._id} className="card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getCategoryColor(group.createdBy)}`}
                          ></div>
                          <span className="text-xs font-medium text-gray-600">
                            {group.createdBy === 'TEACHER' ? 'Teacher Group' : 'Student Group'}
                          </span>
                          {getRoleBadge(userRole)}
                        </div>
                        <CardTitle className="text-lg leading-tight">{group.title}</CardTitle>
                      </div>
                      {getRoleIcon(userRole)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Users size={14} />
                          <span>{memberCount} members</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar size={14} />
                          <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="default" className="text-xs">
                          Public
                        </Badge>
                      </div>

                      <div className="pt-2">
                        <Link to={`/groups/${group._id}`}>
                          <Button className="w-full" variant="outline">
                            View Group
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredGroups.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `No groups match "${searchTerm}"`
                : activeTab === 'created'
                ? "You haven't created any groups yet"
                : "You haven't joined any groups yet"}
            </p>
            {activeTab === 'created' && (
              <Button 
                className="button-gradient text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="mr-2" size={16} />
                Create Your First Group
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateGroupSuccess}
      />
    </div>
  );
};

export default Groups;
