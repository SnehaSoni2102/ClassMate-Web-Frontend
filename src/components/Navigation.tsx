import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Menu, X, User, LogOut, Users, Calendar, Settings, BarChart3, Crown, Shield, MessageCircle, Phone } from 'lucide-react';
import logo from '@/../public/icons/logo.svg';
import { Permission } from '@/types/auth';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { hasPermission, isAdmin, isManager, isTeacher } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      navigate('/');
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  // WhatsApp contact function
  const handleWhatsAppContact = () => {
    // Replace with your actual WhatsApp number
    const phoneNumber = "919876543210"; // Example Indian number format
    const message = "Hi! I need help with Classmate Test.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const navItems = [
    ...(isAuthenticated ? [
      { path: '/dashboard', label: 'Dashboard', icon: User, permission: 'view_dashboard' },
      { path: '/groups', label: 'Groups', icon: Users, permission: 'join_groups' },
      {
        path: '/tests',
        label: 'Tests',
        icon: Calendar,
        permission: 'view_dashboard',
        roles: ['admin', 'manager', 'group-manager', 'teacher']
      },
      { 
        path: '/analytics', 
        label: 'Analytics', 
        icon: BarChart3, 
        permission: 'view_analytics',
        roles: ['admin', 'manager', 'teacher'] 
      },
      { 
        path: '/settings', 
        label: 'Settings', 
        icon: Settings, 
        permission: 'manage_group_settings',
        roles: ['admin'] 
      },
    ] : [])
  ].filter(item => {
    if (!item.permission && !item.roles) return true;
    if (item.permission && !hasPermission(item.permission as Permission)) return false;
    if (item.roles && !item.roles.some(role => user?.role === role)) {
      // Special case for group-manager - they should have same access as manager
      if (user?.role === 'group-manager' && item.roles.includes('manager')) {
        return true;
      }
      return false;
    }
    return true;
  });

  const isActivePath = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Classmate Test Logo" className="size-10" />
              <span className="font-bold text-xl gradient-text">Classmate Test</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-700 hover:text-brand-primary hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* WhatsApp Contact Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppContact}
                className="flex items-center space-x-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                title="Contact us on WhatsApp"
              >
                <MessageCircle size={16} />
                <span className="hidden lg:inline">WhatsApp</span>
              </Button>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {isAdmin() && <Crown size={14} className="text-yellow-500" />}
                      {(isManager() || user?.role === 'group-manager') && <Shield size={14} className="text-blue-500" />}
                      {isTeacher() && <User size={14} className="text-green-500" />}
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{user?.name || 'User'}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-1"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* WhatsApp Contact Button for Unauthenticated Users */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsAppContact}
                    className="flex items-center space-x-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                    title="Contact us on WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span className="hidden lg:inline">WhatsApp</span>
                  </Button>
                  <Link to="/sign-in">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/sign-in">
                    <Button className="button-gradient text-white">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="relative z-50"
              >
                {isMobileMenuOpen ? (
                  <X size={24} className="text-gray-700" />
                ) : (
                  <Menu size={24} className="text-gray-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Overlay */}
          <div 
            className={`fixed inset-0 z-40 overflow-x-hidden md:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 bg-black transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={toggleMobileMenu}
            />
            
            {/* Mobile Menu Panel */}
            <div 
              className='inset-0 w-full overflow-x-hidden fixed h-screen'
            >
              <div 
              className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              >
              <div className="flex flex-col h-screen">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">EP</span>
                    </div>
                    <span className="font-bold text-xl gradient-text">Classmate Test</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMobileMenu}
                    className="md:hidden"
                  >
                    <X size={24} className="text-gray-700" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-white">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={toggleMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-brand-primary text-white'
                          : 'text-gray-700 hover:text-brand-primary hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {/* WhatsApp Contact Button - Mobile */}
                  <button
                    onClick={() => {
                      handleWhatsAppContact();
                      toggleMobileMenu();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                  >
                    <MessageCircle size={20} />
                    <span className="font-medium">Contact on WhatsApp</span>
                  </button>
                </div>

                {/* Auth Section */}
                <div className="border-t p-4 bg-white">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                        <User size={20} className="text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 h-full">
                      <button
                        onClick={() => {
                          handleWhatsAppContact();
                          toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                      >
                        <MessageCircle size={20} />
                        <span className="font-medium">Contact on WhatsApp</span>
                      </button>
                      <Link to="/sign-in" onClick={toggleMobileMenu}>
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/sign-in" onClick={toggleMobileMenu}>
                        <Button className="w-full button-gradient text-white">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleLogoutCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="button-gradient text-white"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
