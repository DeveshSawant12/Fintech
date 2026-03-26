import { useState } from "react";
import { Link } from "react-router";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-white to-[#F7F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
              <span className="text-white font-bold text-xl">SF</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">SmartFinance</span>
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome Back!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Continue your journey towards financial freedom
          </p>
          
          <div className="space-y-4">
            <FeatureItem text="Track your investments in real-time" />
            <FeatureItem text="Access personalized recommendations" />
            <FeatureItem text="Manage your portfolio efficiently" />
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-600 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A5F3D] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#1A5F3D] border-gray-300 rounded focus:ring-[#1A5F3D]" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#1A5F3D] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#1A5F3D] to-[#2D7A4E] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#1A5F3D] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 rounded-full bg-[#1A5F3D]/10 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#1A5F3D]" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
