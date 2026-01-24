import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Github,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center"
    >
      <div className="w-full grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Visual */}
        <motion.div
          className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Background effects */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TrendScout AI</span>
            </motion.div>

            <motion.h1
              className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Unlock your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                viral potential
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Join thousands of creators who use TrendScout AI to discover trends,
              generate viral content, and grow their audience faster than ever.
            </motion.p>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {[
                'AI-powered trend detection',
                'Viral script generation',
                'Competitor analysis',
                'Real-time analytics',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          className="flex items-center justify-center p-8 lg:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TrendScout AI</span>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400 mb-8">Sign in to access your analytics dashboard</p>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading || authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-sm">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                  <Github className="w-5 h-5" />
                  <span className="text-sm">GitHub</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Google</span>
                </button>
              </div>

              <p className="text-center text-gray-400 text-sm mt-6">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>

            </div>

            {/* Back to home link */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoginPage;
