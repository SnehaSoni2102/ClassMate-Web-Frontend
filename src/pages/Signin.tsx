
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Smartphone, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PhoneNumberInput from '@/components/auth/PhoneNumberInput';
import OTPInput from '@/components/auth/OTPInput';

const Signin = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const { login, sendOTP, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users away from sign-in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await sendOTP(mobile);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login({ mobile, otp });
      toast({
        title: "Login Successful",
        description: "Welcome to Classmate Test!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your OTP and try again",
        variant: "destructive"
      });
    }
  };

  const handleResendOTP = async () => {
    clearError();
    try {
      await sendOTP(mobile);
      toast({
        title: "OTP Resent",
        description: `New verification code sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  // Show a lightweight loader while auth state initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">EP</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Welcome to Classmate Test</h1>
          <p className="text-gray-600 mt-2">Sign in to continue your learning journey</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {step === 'mobile' ? (
                <>
                  <Smartphone size={20} />
                  <span>Enter Mobile Number</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>Verify OTP</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {step === 'mobile' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <PhoneNumberInput
                  value={mobile}
                  onChange={setMobile}
                  error={error}
                  disabled={isLoading}
                  placeholder="Enter your mobile number"
                />
                
                <Button 
                  type="submit" 
                  className="w-full button-gradient text-white"
                  disabled={isLoading || mobile.length !== 10}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  error={error}
                  disabled={isLoading}
                  autoFocus={true}
                />

                <Button 
                  type="submit" 
                  className="w-full button-gradient text-white"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Resend OTP
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep('mobile');
                      setOtp('');
                      clearError();
                    }}
                    className="text-sm"
                  >
                    Change Mobile Number
                  </Button>
                </div>
              </form>
            )}

            {/* Demo Instructions */}
            {/* <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">Demo Instructions:</p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• Use 9876543210 for admin user demo</li>
                <li>• Use 9876543211 for student user demo</li>
                <li>• Use 9876543212 for manager user demo</li>
                <li>• Enter any 6-digit number as OTP</li>
              </ul>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-brand-primary hover:underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-brand-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
