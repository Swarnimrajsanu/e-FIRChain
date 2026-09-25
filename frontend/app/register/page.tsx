'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, Shield, ChevronRight, UserPlus
} from 'lucide-react';

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'CITIZEN',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-off-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="gov-card overflow-hidden">
          {/* Header */}
          <div className="bg-navy px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="relative w-14 h-14">
                <Image src="/emblem.png" alt="e-FIRChain" fill className="object-contain" />
              </div>
            </div>
            <h1 className="text-white font-bold text-xl font-serif">Citizen Registration</h1>
            <p className="text-gray-300 text-sm mt-1">e-FIRChain — Government of India</p>
          </div>

          {/* Tricolor divider */}
          <div className="tricolor-bar" />

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 bg-saffron rounded" />
              <h2 className="text-navy font-bold text-lg">Create Your Account</h2>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="register-form">

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="gov-label">Full Name (as per ID) *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="gov-input pl-10"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="gov-label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="gov-input pl-10"
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="gov-label">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="gov-input pl-10"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="gov-label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="gov-input pl-10 pr-12"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicators */}
                {formData.password && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {passwordRules.map(({ test, label }) => (
                      <div key={label} className={`flex items-center gap-1.5 text-xs ${test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className={`w-3 h-3 ${test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="gov-label">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`gov-input pl-10 pr-12 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-400 focus:border-red-400'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-400 focus:border-green-400'
                        : ''
                    }`}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <input id="terms" type="checkbox" required className="mt-0.5 accent-navy" />
                <label htmlFor="terms">
                  I agree to the{' '}
                  <a href="#" className="text-navy underline">Terms of Use</a> and{' '}
                  <a href="#" className="text-navy underline">Privacy Policy</a> of the Government of India.
                </label>
              </div>

              {/* Submit */}
              <button
                id="register-submit"
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
                    Creating Account…
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register as Citizen
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-5 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-navy font-semibold hover:text-saffron transition-colors">
                Sign in here <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </p>

            {/* Security note */}
            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-200">
              <Shield className="w-4 h-4 text-gov-green flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Your information is protected under the IT Act, 2000 and the PDPB framework.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}