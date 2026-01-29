import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
            <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
            <p className="text-gray-600">Last updated: December 14, 2024</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Registration</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All participants must complete valid registration before the test.</li>
                <li>Once registered, the fee (if any) is non-refundable.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Test Format</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>The format and schedule of the test will be shared in advance.</li>
                <li>In case of any technical issues, the organizer's decision will be final.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Code of Conduct</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Students must maintain honesty and discipline during the test.</li>
                <li>Any malpractice may lead to disqualification.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Results</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Results will be declared on the specified date.</li>
                <li>No disputes will be entertained regarding the result.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Rewards and Certificates</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Prizes/certificates will only be given to eligible participants.</li>
                <li>No cash alternatives unless stated clearly.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Privacy</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Student data will be used only for academic purposes.</li>
                <li>No data will be shared with third parties without consent.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Organizer Rights</h2>
              <p className="text-gray-700 mb-4">
                Organizers <b>(Amkrfashion)</b> reserve the right to amend rules, cancel the test, or disqualify participants as needed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  Email: clasmatetest@gmail.com<br />
                  Phone: +91-9337690741
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
