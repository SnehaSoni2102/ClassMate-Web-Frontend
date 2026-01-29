import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GroupService } from "@/services/group.service";
import { GroupApiResponse, GroupSearchMember } from "@/types/group";
import { Test } from "@/types/test";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  AlertCircle,
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  Crown,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  UserPlus,
  UserMinus,
  MessageCircle,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupData, setGroupData] = useState<GroupApiResponse | null>(null);
  const [members, setMembers] = useState<GroupSearchMember[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Handle tab changes - update URL
  const handleTabChange = (tabValue: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabValue);
    setSearchParams(newSearchParams);
  };

  // Subscription management state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [memberDurations, setMemberDurations] = useState<Record<string, number>>({});
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);

  // Role management state
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [demotingUserId, setDemotingUserId] = useState<string | null>(null);

  // Handle initial tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && !['overview', 'members', 'tests'].includes(tabParam)) {
      // Invalid tab, redirect to overview
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', 'overview');
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);

  // Load group data, members and tests simultaneously
  useEffect(() => {
    const loadGroupData = async () => {
      if (!id) {
        setError("Group ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch group details and members first
        const [groupResponse, membersResponse] = await Promise.all([
          GroupService.getGroup(id),
          GroupService.searchGroupMembers(id),
        ]);
        
        setGroupData(groupResponse);
        setMembers(membersResponse);

        // Try to fetch tests, but handle 403 gracefully for members
        try {
          const testsResponse = await GroupService.getGroupTests(id);
          console.log("Group tests response:", testsResponse);
          setTests(testsResponse);
        } catch (testError: any) {
          console.log("Test fetch error (may be expected for members):", testError);

          // If it's a 403 (Forbidden) error, it means the user doesn't have permission to view tests
          // This is expected for regular members, so we just set tests to empty array
          if (testError?.response?.status === 403 || testError?.status === 403) {
            console.log("User doesn't have permission to view tests - this is normal for members");
            setTests([]);
          } else {
            // For other errors, we still want to show them
            console.error("Unexpected error fetching tests:", testError);
            // Don't set a global error for test fetch failures
          }
        }
      } catch (error: any) {
        console.error("Load group data error:", error);
        setError(error.message || "Failed to load group details");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [id]);

  // Helper function to get user role from group members
  const getUserRole = (): string => {
    if (!user?._id || members.length === 0) return "member";

    const member = members.find((m) => m._id === user._id);
    return member?.groupRole || "member";
  };

  // Subscription management functions
  const handleMemberSelect = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
      // Set default duration to 1 month if not set
      if (!memberDurations[memberId]) {
        setMemberDurations(prev => ({ ...prev, [memberId]: 1 }));
      }
    } else {
      newSelected.delete(memberId);
      // Remove duration for unselected member
      setMemberDurations(prev => {
        const newDurations = { ...prev };
        delete newDurations[memberId];
        return newDurations;
      });
    }
    setSelectedMembers(newSelected);
  };

  const handleDurationChange = (memberId: string, duration: number) => {
    setMemberDurations(prev => ({ ...prev, [memberId]: duration }));
  };

  const calculateTotalPrice = (): number => {
    if (!groupData?.pricePerStudent) return 0;

    return Array.from(selectedMembers).reduce((total, memberId) => {
      const duration = memberDurations[memberId] || 1;
      const priceOption = groupData.pricePerStudent?.find(p => p.duration === duration);
      return total + (priceOption?.price || 0);
    }, 0);
  };

  const getNonAdminMembers = () => {
    return members.filter(member => member.groupRole !== "group-admin");
  };

  // Role management functions
  const handlePromoteToManager = async (userId: string) => {
    if (!groupData || promotingUserId) return;

    setPromotingUserId(userId);
    try {
      await GroupService.assignManager(groupData._id, userId);

      // Refetch members data
      const membersResponse = await GroupService.searchGroupMembers(groupData._id);
      setMembers(membersResponse);

      toast({
        title: "Success",
        description: "Member has been promoted to manager successfully.",
      });
    } catch (error: any) {
      console.error("Error promoting member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote member to manager.",
        variant: "destructive",
      });
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleDemoteFromManager = async (userId: string) => {
    if (!groupData || demotingUserId) return;

    setDemotingUserId(userId);
    try {
      await GroupService.demoteManager(groupData._id, userId);

      // Refetch members data
      const membersResponse = await GroupService.searchGroupMembers(groupData._id);
      setMembers(membersResponse);

      toast({
        title: "Success",
        description: "Manager has been demoted to member successfully.",
      });
    } catch (error: any) {
      console.error("Error demoting manager:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to demote manager to member.",
        variant: "destructive",
      });
    } finally {
      setDemotingUserId(null);
    }
  };

  // Helper function to format date with ordinal suffix
  const formatDateWithOrdinal = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Don't show negative days
  };

  const handleBuySubscription = async () => {
    if (!groupData || !user || selectedMembers.size === 0) return;

    setIsProcessingSubscription(true);

    try {
      // Prepare subscription data
      const subscriptionData = {
        groupId: groupData._id,
        users: Array.from(selectedMembers).map(memberId => ({
          userId: memberId,
          duration: memberDurations[memberId] || 1
        })),
        amount: calculateTotalPrice(),
        currency: "INR",
        senderMode: "teacher",
        description: `Group subscription payment for GroupId: ${groupData._id} & Groupname: ${groupData.title}`
      };

      console.log("Creating transaction with data:", subscriptionData);

      // 1st API call: Create website transaction
      const transactionResponse = await GroupService.createWebsiteTransaction(subscriptionData);
      const transactionId = transactionResponse.transactionId || transactionResponse._id;

      console.log("Transaction created successfully:", transactionResponse);

      // 2nd API call: Create transaction order
      const orderData = {
        transactionId: transactionId
      };

      console.log("Creating transaction order with data:", orderData);

      const orderResponse = await GroupService.createTransactionOrder(orderData);
      console.log("Transaction order response:", orderResponse);

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_R6SY9LDGgG5ZTm', // Your Razorpay public key
        amount: orderResponse.amount, // Amount in paise
        currency: orderResponse.currency,
        name: 'Classmate Test',
        description: subscriptionData.description,
        order_id: orderResponse.id,
        handler: function (response: any) {
          // Payment successful
          console.log('Payment successful:', response);

          // Navigate to verification page with payment details
          const searchParams = new URLSearchParams({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          navigate(`/payment-verification?${searchParams.toString()}`);
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phoneNumber || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessingSubscription(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Error during subscription purchase:", error);
      setIsProcessingSubscription(false);
      // You might want to show a toast notification or error message to the user here
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "group-admin":
        return <Crown className="text-yellow-500" size={16} />;
      case "group-manager":
        return <Shield className="text-blue-500" size={16} />;
      default:
        return <User className="text-gray-500" size={16} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "group-admin":
        return <Badge className="bg-yellow-100 text-yellow-800">Admin</Badge>;
      case "group-manager":
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="text-green-500" size={16} />;
      case "completed":
        return <CheckCircle className="text-blue-500" size={16} />;
      case "scheduled":
        return <Clock className="text-yellow-500" size={16} />;
      case "draft":
        return <BookOpen className="text-gray-500" size={16} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <BookOpen className="text-gray-500" size={16} />;
    }
  };

  const getTestStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading group details..." />
      </div>
    );
  }

  // Error state
  if (error || !groupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Group
          </h3>
          <p className="text-gray-600 mb-4">{error || "Group not found"}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const userRole = getUserRole();
  const memberCount = members.length;
  const invitedCount = groupData?.invitedUsers.length || 0;
  const joinRequestsCount = groupData?.joinRequests.length || 0;
  const isStudentGroup = groupData?.createdBy === "STUDENT";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/groups">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2" size={16} />
                Back to Groups
              </Button>
            </Link>
            {getRoleBadge(userRole)}
          </div>

          <div className="flex items-start space-x-4">
            {groupData.logo && (
              <img
                src={groupData.logo}
                alt="Group Logo"
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {groupData.title}
              </h1>
              <p className="text-gray-600 mt-2">{groupData.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>
                  Created {new Date(groupData.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>
                  {groupData.createdBy === "TEACHER"
                    ? "Teacher Group"
                    : "Student Group"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="text-brand-primary" size={20} />
                <div>
                  <p className="text-2xl font-bold">{memberCount}</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-brand-primary" size={20} />
                <div>
                  <p className="text-2xl font-bold">{tests.length}</p>
                  <p className="text-sm text-gray-600">Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="text-brand-primary" size={20} />
                <div>
                  <p className="text-2xl font-bold">{invitedCount}</p>
                  <p className="text-sm text-gray-600">Invited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-brand-primary" size={20} />
                <div>
                  <p className="text-2xl font-bold">{joinRequestsCount}</p>
                  <p className="text-sm text-gray-600">Join Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Group Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span>{groupData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span>{groupData.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>
                          {groupData.createdBy === "TEACHER"
                            ? "Teacher Group"
                            : "Student Group"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>
                          {new Date(groupData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Your Role
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(userRole)}
                      <span className="capitalize">
                        {userRole.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Group Links Section */}
          {(groupData?.whatsappLink || groupData?.youtubeLink) && (
            <Card>
              <CardHeader>
                <CardTitle>Group Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupData.whatsappLink && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <MessageCircle className="text-green-600" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">WhatsApp Group</p>
                        <p className="text-sm text-green-700 truncate">{groupData.whatsappLink}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => window.open(groupData.whatsappLink, '_blank')}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Join
                      </Button>
                    </div>
                  )}

                  {groupData.youtubeLink && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <Youtube className="text-red-600" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">YouTube Channel</p>
                        <p className="text-sm text-red-700 truncate">{groupData.youtubeLink}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                        onClick={() => window.open(groupData.youtubeLink, '_blank')}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Visit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="members" className="space-y-6">

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Group Members ({memberCount})</CardTitle>
                {userRole === "group-admin" && groupData?.createdBy === "TEACHER" && !isStudentGroup && groupData?.pricePerStudent && (
                  <p className="text-sm text-gray-600 mt-2">
                    Select members to purchase subscriptions for them
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => {
                    const isGroupAdmin = member.groupRole === "group-admin";
                    const isTeacherGroup = groupData?.createdBy === "TEACHER";
                    const hasActiveSubscription = member.subscription && member.subscription.status === 'active';
                    const canSelect = userRole === "group-admin" && isTeacherGroup && !isGroupAdmin && !isStudentGroup;
                    const isSelected = selectedMembers.has(member._id);
                    const subscriptionEndDate = member.subscription?.endDate;

                    // Determine background color based on member status
                    let backgroundClass = '';
                    if (isStudentGroup) {
                      // For student groups, all members look the same
                      backgroundClass = '';
                    } else {
                      // For teacher groups, show subscription status
                      if (isSelected) {
                        backgroundClass = 'bg-blue-50 border-blue-200';
                      } else if (hasActiveSubscription) {
                        backgroundClass = 'bg-green-50 border-green-200';
                      } else if (!isGroupAdmin && isTeacherGroup) {
                        // Members without subscription get yellow background
                        backgroundClass = 'bg-yellow-50 border-yellow-200';
                      }
                    }

                    return (
                      <div
                        key={member._id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${backgroundClass}`}
                      >
                        <div className="flex items-center space-x-3">
                          {canSelect && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleMemberSelect(member._id, checked as boolean)}
                            />
                          )}
                          <Avatar>
                            {member.profilePicture ? (
                              <img
                                src={member.profilePicture}
                                alt={member.Name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {member?.Name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.Name}</p>
                            {(userRole === "group-admin" || userRole === "group-manager") && (
                              <>
                                <p className="text-sm text-gray-500">{member.email}</p>
                                <p className="text-xs text-gray-400">{member.phoneNumber}</p>
                              </>
                            )}
                            {/* Enhanced subscription display for student groups */}
                            {member.subscription && (
                              <div className="mt-2 space-y-1">
                                {isStudentGroup ? (
                                  <div className="text-xs">
                                    {hasActiveSubscription ? (
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="text-green-500" size={12} />
                                        <span className="text-green-700 font-medium">
                                          {member.subscription.duration} month subscription
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <AlertCircle className="text-yellow-500" size={12} />
                                        <span className="text-yellow-700 font-medium">
                                          No active subscription
                                        </span>
                                      </div>
                                    )}
                                    {subscriptionEndDate && (
                                      <p className="text-gray-600 mt-1">
                                        Ends: {formatDateWithOrdinal(new Date(subscriptionEndDate))}
                                        {hasActiveSubscription && (
                                          <span className="text-green-700 font-medium ml-2">
                                            ({calculateDaysLeft(subscriptionEndDate)} days left)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  /* Teacher group subscription display (existing) */
                                  hasActiveSubscription && subscriptionEndDate && (
                                    <p className="text-xs text-green-600 font-medium">
                                      Subscription ends: {formatDateWithOrdinal(new Date(subscriptionEndDate))} ({calculateDaysLeft(subscriptionEndDate)} days left)
                                    </p>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {getRoleBadge(member.groupRole)}
                          </div>

                          {/* Role management buttons for group admins */}
                          {userRole === "group-admin" && member.groupRole !== "group-admin" && (
                            <div className="w-full max-w-32">
                              {member.groupRole === "member" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePromoteToManager(member._id)}
                                  disabled={promotingUserId === member._id}
                                  className="w-full text-xs"
                                >
                                  {promotingUserId === member._id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                      Promoting...
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Promote
                                    </>
                                  )}
                                </Button>
                              )}
                              {member.groupRole === "group-manager" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDemoteFromManager(member._id)}
                                  disabled={demotingUserId === member._id}
                                  className="w-full text-xs"
                                >
                                  {demotingUserId === member._id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                      Demoting...
                                    </>
                                  ) : (
                                    <>
                                      <UserMinus className="h-3 w-3 mr-1" />
                                      Demote
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}

                          {canSelect && isSelected && (
                            <Select
                              value={memberDurations[member._id]?.toString() || "1"}
                              onValueChange={(value) => handleDurationChange(member._id, parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {groupData?.pricePerStudent?.map((priceOption) => (
                                  <SelectItem key={priceOption._id} value={priceOption.duration.toString()}>
                                    {priceOption.duration} month{priceOption.duration > 1 ? 's' : ''} - ₹{priceOption.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>


            {/* Subscription Management Section for Group Admins (Teacher Groups Only) */}
            {userRole === "group-admin" && groupData?.createdBy === "TEACHER" && !isStudentGroup && groupData?.pricePerStudent && selectedMembers.size > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="text-blue-500" size={20} />
                      <span>Subscription Management</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''} selected for subscription
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Subscription Summary</h4>
                    <div className="space-y-2 text-sm">
                      {Array.from(selectedMembers).map(memberId => {
                        const member = members.find(m => m._id === memberId);
                        const duration = memberDurations[memberId] || 1;
                        const priceOption = groupData.pricePerStudent?.find(p => p.duration === duration);
                        const hasActiveSubscription = member?.subscription && member.subscription.status === 'active';
                        return (
                          <div key={memberId} className="flex justify-between">
                            <span className="flex items-center space-x-2">
                              <span>{member?.Name}</span>
                              {hasActiveSubscription && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Renewal
                                </Badge>
                              )}
                            </span>
                            <span>{duration} month{duration > 1 ? 's' : ''} - ₹{priceOption?.price || 0}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>₹{calculateTotalPrice()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleBuySubscription}
                      disabled={isProcessingSubscription}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingSubscription ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Buy Subscription (₹${calculateTotalPrice()})`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="inline w-fit">
                  Tests {userRole === "member" ? "" : `(${tests.length})`}
                </CardTitle>
                {(userRole === "group-admin" || userRole === "group-manager") && (
                  <div className="flex space-x-2">
                    <Link to={`/groups/${id}/find-all-test-for-addition`}>
                      <Button variant="outline">
                        Find & Add Global Tests
                      </Button>
                    </Link>
                    <Link to={`/groups/${id}/create-test`} className="inline w-fit">
                      <Button className="button-gradient text-white">
                        Create Test
                      </Button>
                    </Link>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {tests.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen
                      className="mx-auto text-gray-400 mb-4"
                      size={48}
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {userRole === "member" ? "Access Restricted" : "No tests yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {userRole === "member"
                        ? "You are a member and don't have permission to view or manage tests. Only group admins and managers can access this feature."
                        : "Tests will appear here once they are created."
                      }
                    </p>
                    {(userRole === "group-admin" || userRole === "group-manager") && (
                      <Link to={`/groups/${id}/create-test`}>
                        <Button className="button-gradient text-white">
                          Create Test
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tests.map((test) => (
                      <div
                        key={test._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getTestStatusIcon(test.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {test.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {test.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>{test.totalQuestions} questions</span>
                              <span>•</span>
                              <span>{Number(test?.durationInMinutes/60)} mins</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getTestStatusBadge(test.status)}
                          {(userRole === "group-admin" ||
                            userRole === "group-manager") && (
                            <Link to={`/groups/${id}/edit-test/${test._id}`}>
                              <Button variant="outline" size="sm">
                                Edit Test
                              </Button>
                            </Link>
                          )}
                          <Link to={`/groups/${id}/test-preview/${test._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
