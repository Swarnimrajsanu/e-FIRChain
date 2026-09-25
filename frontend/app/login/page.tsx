'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Lock, Eye, EyeOff, AlertCircle, LogIn, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser?.role === 'POLICE') {
        router.push('/officer/dashboard');
      } else if (parsedUser?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { role: 'Citizen', email: 'citizen@test.com', badge: 'bg-gov-green' },
    { role: 'Police', email: 'police@test.com', badge: 'bg-navy' },
    { role: 'Admin', email: 'admin@test.com', badge: 'bg-red-700' },
  ];

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-off-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="gov-card overflow-hidden">
          {/* Header bar */}
          <div className="bg-navy px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="relative w-14 h-14">
                <Image src="/emblem.png" alt="e-FIRChain" fill className="object-contain" />
              </div>
            </div>
            <h1 className="text-white font-bold text-xl font-serif">Citizen Login Portal</h1>
            <p className="text-gray-300 text-sm mt-1">e-FIRChain — Government of India</p>
          </div>

          {/* Tricolor divider */}
          <div className="tricolor-bar" />

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 bg-saffron rounded" />
              <h2 className="text-navy font-bold text-lg">Sign In to Your Account</h2>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="gov-label">
                  Registered Email Address *
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="gov-input"
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="gov-label">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="gov-input pr-12"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating…
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In Securely
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-gray-600 mt-5 text-sm">
              New user?{' '}
              <Link href="/register" className="text-navy font-semibold hover:text-saffron transition-colors">
                Register here <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </p>

            {/* Security note */}
            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-200">
              <Lock className="w-4 h-4 text-gov-green flex-shrink-0" />
              <p className="text-xs text-gray-500">
                This is a secure government portal. Your data is protected with 256-bit SSL encryption.
              </p>
            </div>
          </div>
        </div>

        {/* Test accounts info */}
        <div className="mt-4 gov-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-navy" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Demo Accounts (Dev Only)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {testAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword('Test@1234'); }}
                className="border border-gray-200 rounded p-2 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className={`${acc.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded block mb-1`}>
                  {acc.role}
                </span>
                <span className="text-gray-500 text-[10px] break-all">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">Password for all: <strong className="text-gray-600">Test@1234</strong> — Click a tile to autofill</p>
        </div>
      </div>
    </div>
  );
}