import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  User, 
  Trophy, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Create or join study groups with friends. Collaborate and learn together.',
      color: 'bg-brand-primary'
    },
    {
      icon: Calendar,
      title: 'Practice Tests',
      description: 'Take unlimited practice tests for school and competitive exams.',
      color: 'bg-brand-yellow'
    },
    {
      icon: Trophy,
      title: 'Track Progress',
      description: 'Monitor your performance and see detailed analytics of your growth.',
      color: 'bg-brand-pink'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your data is protected with enterprise-grade security measures.',
      color: 'bg-brand-orange'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Students' },
    { number: '500+', label: 'Study Groups' },
    { number: '50K+', label: 'Tests Completed' },
    { number: '95%', label: 'Success Rate' }
  ];

  const benefits = [
    'Join or create study groups with minimum 5 members',
    'Take tests together and compete with friends',
    'Get detailed performance analytics',
    'Prepare for school and competitive exams',
    'Mobile-first responsive design',
    'Secure OTP-based authentication'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="absolute inset-0 bg-hero-gradient opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Prepare for Exams with
              <span className="block gradient-text">Your Study Squad</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join study groups, take practice tests together, and track your progress. 
              The perfect platform for collaborative exam preparation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/sign-in">
                <Button size="lg" className="button-gradient text-white px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="#features">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="gradient-text"> Excel in Exams</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your exam preparation more effective and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose
                <span className="gradient-text"> Classmate Test?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of students who have improved their exam scores through collaborative learning and practice.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/sign-in">
                  <Button size="lg" className="button-gradient text-white">
                    Start Your Journey
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card-gradient rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold">Study Group: JEE Prep 2024</div>
                      <div className="text-sm text-gray-500">12 members</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Physics Mock Test</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Math Practice Set</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Chemistry Quiz</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Upcoming</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of successful students and start your preparation journey today.
          </p>
          <Link to="/sign-in">
            <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100 px-8 py-4 text-lg">
              Get Started Now
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
