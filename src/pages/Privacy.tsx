import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Shield className="text-brand-primary" size={24} />
              <span>Privacy Policy</span>
            </CardTitle>
            <p className="text-gray-600">Last updated: December 14, 2024</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Collection of Personal Information</h2>
              <p className="text-gray-700 mb-4">
                We <b>(Amkrfashion)</b> may collect details such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name</li>
                <li>Email</li>
                <li>Phone number</li>
                <li>Class</li>
                <li>School</li>
                <li>City</li>
              </ul>
              <p className="text-gray-700">
                This information is collected for registration and test purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Use of Information</h2>
              <p className="text-gray-700 mb-4">
                Your information may be used for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Test registration and identity verification</li>
                <li>Result notification</li>
                <li>Issuance of certificates/prizes</li>
                <li>Sharing academic updates (with consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <div className="flex items-start space-x-3">
                  <Lock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-yellow-700 text-sm">
                      Your information is stored securely. We implement reasonable technical safeguards to protect your data.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not share your personal data with any third party without your permission, unless required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                For website/app users:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We may use cookies to enhance your experience</li>
                <li>Personal identity will not be tracked without consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Your Consent</h2>
              <p className="text-gray-700 mb-4">
                By agreeing to our policy, you consent to the use of your personal data as described.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions or concerns regarding your data, contact us at:
              </p>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                    <p className="text-gray-700 text-sm">
                    clasmatetest@gmail.com
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                  <p className="text-gray-700 text-sm">
                    +91-9337690741
                  </p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
