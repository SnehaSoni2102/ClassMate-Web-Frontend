import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GroupService } from '@/services/group.service';
import { UserService } from '@/services/user.service';
import { UserSearchResult } from '@/types/auth';
import { X, Upload, Plus, Search, Loader2, MessageCircle, Youtube } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [createdBy, setCreatedBy] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [logo, setLogo] = useState<File | null>(null);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await UserService.searchUsers(searchQuery.trim());
        setSearchResults(results);
    } catch (error: any) {
        toast({
          title: 'Search Error',
          description: 'Failed to search users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, toast]);

  const handleAddUser = (user: UserSearchResult) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      toast({
        title: 'Duplicate User',
        description: 'This user has already been added',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a group title',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a group description',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length < 5) {
      toast({
        title: 'Validation Error',
        description: 'Please invite at least 5 users',
        variant: 'destructive',
      });
      return;
    }

    // Validate WhatsApp link if provided
    if (whatsappLink.trim()) {
      try {
        new URL(whatsappLink);
      } catch {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid WhatsApp link URL',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate YouTube link if provided
    if (youtubeLink.trim()) {
      try {
        new URL(youtubeLink);
      } catch {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid YouTube link URL',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('createdBy', createdBy);

      // Send selected users' phone numbers as comma-separated string
      const phoneNumbers = selectedUsers.map(user => user.phoneNumber);
      formData.append('invitedPhoneNumbers', phoneNumbers.join(','));

      if (logo) {
        formData.append('logo', logo);
      }

      if (whatsappLink.trim()) {
        formData.append('whatsappLink', whatsappLink.trim());
      }

      if (youtubeLink.trim()) {
        formData.append('youtubeLink', youtubeLink.trim());
      }

      await GroupService.createGroup(formData);
      
      toast({
        title: 'Group Created',
        description: 'Your group has been created successfully!',
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      setCreatedBy('STUDENT');
      setLogo(null);
      setWhatsappLink('');
      setYoutubeLink('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Failed to Create Group',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Study Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Group Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter group title"
              required
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Group Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your study group"
              rows={3}
              required
            />
          </div>

          {/* Created By */}
          <div className="space-y-2">
            <Label>Group Type *</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="STUDENT"
                  checked={createdBy === 'STUDENT'}
                  onChange={(e) => setCreatedBy(e.target.value as 'TEACHER' | 'STUDENT')}
                  className="text-brand-primary"
                />
                <span>Student Group</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="TEACHER"
                  checked={createdBy === 'TEACHER'}
                  onChange={(e) => setCreatedBy(e.target.value as 'TEACHER' | 'STUDENT')}
                  className="text-brand-primary"
                />
                <span>Teacher Group</span>
              </label>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Group Logo (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo')?.click()}
                className="flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>{logo ? logo.name : 'Choose Logo'}</span>
              </Button>
              {logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogo(null)}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* WhatsApp Link */}
          <div className="space-y-2">
            <Label htmlFor="whatsappLink" className="flex items-center space-x-2">
              <MessageCircle size={16} className="text-green-600" />
              <span>WhatsApp Group Link (Optional)</span>
            </Label>
            <Input
              id="whatsappLink"
              type="url"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          {/* YouTube Link */}
          <div className="space-y-2">
            <Label htmlFor="youtubeLink" className="flex items-center space-x-2">
              <Youtube size={16} className="text-red-600" />
              <span>YouTube Channel Link (Optional)</span>
            </Label>
            <Input
              id="youtubeLink"
              type="url"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* User Search and Selection */}
          <div className="space-y-2">
            <Label htmlFor="userSearch">
              Invite Users * (Minimum 5)
            </Label>
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="userSearch"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleAddUser(user)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{user?.Name}</div>
                        <div className="text-sm text-gray-500">{user?.phoneNumber?.slice(0, 3)} *** *** {user?.phoneNumber?.slice(7)}</div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length > 0 && searchResults.length === 0 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1 p-4 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </div>

              {/* Selected Users List */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {selectedUsers.length}/5 minimum required
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user._id}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{user.Name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user._id)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedUsers.length < 5}
              className="button-gradient text-white"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal; 