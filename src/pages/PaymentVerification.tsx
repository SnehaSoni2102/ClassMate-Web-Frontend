import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { GroupService } from '@/services/group.service';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpaySignature = searchParams.get('razorpay_signature');

  const verifyPayment = async () => {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      setVerificationResult({
        success: false,
        message: 'Missing payment verification details'
      });
      setIsVerifying(false);
      return;
    }

    try {
      setIsVerifying(true);
      const response = await GroupService.verifyPayment({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      });

      // Handle the API response
      setVerificationResult({
        success: response?.success || false,
        message: response?.message || 'Payment verification completed',
        data: response
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setVerificationResult({
        success: false,
        message: error?.message || error?.response?.data?.message || 'Payment verification failed'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  const handleRetryVerification = () => {
    verifyPayment();
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin h-6 w-6" />
                <span>Verifying Payment</span>
              </>
            ) : verificationResult?.success ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Payment Successful</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <span>Payment Failed</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying ? (
            <div className="text-center space-y-2">
              <p className="text-gray-600">Please wait while we verify your payment...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : verificationResult ? (
            <div className="text-center space-y-4">
              <p className={`text-lg font-medium ${verificationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.message}
              </p>

              {verificationResult.success && verificationResult.data && (
                <div className="bg-green-50 p-3 rounded-lg text-left">
                  <p className="text-sm text-gray-600 mb-2">Payment Details:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Order ID:</span> {razorpayOrderId}</p>
                    <p><span className="font-medium">Payment ID:</span> {razorpayPaymentId}</p>
                  </div>
                </div>
              )}

              {!verificationResult.success && (
                <div className="space-y-3">
                  <Button
                    onClick={handleRetryVerification}
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Verification
                      </>
                    )}
                  </Button>
                </div>
              )}

             {verificationResult.success && <Button
                onClick={handleGoBack}
                className="w-full"
                variant="outline"
              >
                Go Back
              </Button>}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentVerification;
