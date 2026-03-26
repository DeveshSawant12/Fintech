import { useState } from "react";
import { Link } from "react-router";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
    window.location.href = "/dashboard";
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-white to-[#F7F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
                <span className="text-white font-bold text-xl">SF</span>
              </div>
              <span className="font-bold text-xl text-gray-900">SmartFinance</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8">Start your financial journey today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <label className="flex items-start">
              <input type="checkbox" className="w-4 h-4 text-[#1A5F3D] border-gray-300 rounded focus:ring-[#1A5F3D] mt-1" required />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-[#1A5F3D] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Right Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
              <span className="text-white font-bold text-xl">SF</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">SmartFinance</span>
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Start Your Financial Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust SmartFinance for their financial planning
          </p>
          
          <div className="bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
            <div className="space-y-4">
              <BenefitItem text="Expert financial advisors" />
              <BenefitItem text="Personalized investment strategies" />
              <BenefitItem text="Advanced portfolio analytics" />
              <BenefitItem text="24/7 customer support" />
              <BenefitItem text="Secure and transparent platform" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <span>{text}</span>
    </div>
  );
}
