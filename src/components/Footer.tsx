import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  // Facebook,
  // Instagram,
  // Linkedin,
  // Twitter,
  // Youtube
} from 'lucide-react';
import logo from '@/../public/icons/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Classmate Test Logo" className="size-10" />
              <span className="text-2xl font-bold gradient-text">Classmate Test</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering students to achieve their dreams through comprehensive test preparation, 
              collaborative study groups, and personalized learning experiences.
            </p>
            
            {/* Social Links */}
            {/* <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors">
                <Youtube size={18} />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-gray-300 hover:text-white transition-colors">
                  Study Groups
                </Link>
              </li>
              <li>
                <Link to="/tests" className="text-gray-300 hover:text-white transition-colors">
                  Tests & Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            
            {/* Contact Info */}
            {/* <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail size={16} />
                <span className="text-sm">support@classmatetest.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone size={16} />
                <span className="text-sm">+91-9876543210</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Classmate Test. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
             Co-powered by Manita Kumari
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
