'use client';

import { useAuth } from '@/lib/auth-context';
import {
  CheckCircle, LogOut, Menu, Shield, User, X,
  ChevronDown, Bell, Phone, UserPlus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAdmin, isPolice, isCitizen, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const citizenLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <User className="w-4 h-4" /> },
    { name: 'File FIR', href: '/file-fir', icon: <Shield className="w-4 h-4" /> },
    { name: 'My FIRs', href: '/firs', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const policeLinks = [
    { name: 'Officer Dashboard', href: '/officer/dashboard', icon: <Shield className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: <Shield className="w-4 h-4" /> },
    { name: 'Verify FIRs', href: '/admin/pending?tab=verify', icon: <CheckCircle className="w-4 h-4" /> },
    { name: 'Assign Officer', href: '/admin/pending?tab=assign', icon: <UserPlus className="w-4 h-4" /> },
  ];

  const getRoleLinks = () => {
    if (isAdmin) return adminLinks;
    if (isPolice) return policeLinks;
    if (isCitizen) return citizenLinks;
    return [];
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-600',
      POLICE: 'bg-blue-700',
      CITIZEN: 'bg-green-700',
    };
    return (
      <span className={`text-xs text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide ${colors[user.role] || 'bg-gray-600'}`}>
        {user.role}
      </span>
    );
  };

  return (
    <header>
      {/* Tricolor bar */}
      <div className="tricolor-bar" />

      {/* Top utility bar */}
      <div className="bg-navy-dark text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-1.5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="ticker-dot" />
              <span className="text-green-400 font-semibold">System Online</span>
            </span>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="items-center gap-1 text-gray-300 hidden sm:flex">
              <Phone className="w-3 h-3" />
              Helpline: 1800-XXX-XXXX (Toll Free)
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <span>Skip to Main Content</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Screen Reader Access</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-navy shadow-gov-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/emblem.png"
                  alt="e-FIRChain Emblem"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight font-serif tracking-wide group-hover:text-gold transition-colors">
                  e-FIRChain
                </div>
                <div className="text-gray-300 text-[10px] leading-tight uppercase tracking-widest hidden sm:block">
                  National Digital FIR Portal
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="text-gray-200 hover:text-white hover:bg-navy-light px-3 py-2 rounded text-sm font-medium transition-all">
                Home
              </Link>

              {user ? (
                <>
                  {getRoleLinks().map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-1.5 text-gray-200 hover:text-white hover:bg-navy-light px-3 py-2 rounded text-sm font-medium transition-all"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}

                  <div className="ml-3 flex items-center gap-2 border-l border-navy-light pl-3">
                    {getRoleBadge()}
                    <span className="text-gray-300 text-sm">{user.name || user.email}</span>
                    <button
                      onClick={logout}
                      title="Logout"
                      className="flex items-center gap-1.5 text-red-300 hover:text-red-200 hover:bg-red-900/30 px-2 py-2 rounded text-sm transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    href="/login"
                    className="text-gray-200 hover:text-white hover:bg-navy-light px-3 py-2 rounded text-sm font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link href="/register" className="btn-saffron text-sm py-2 px-4">
                    Register / File FIR
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 rounded hover:bg-navy-light transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-navy-light bg-navy-dark">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" className="block px-3 py-2 rounded text-gray-200 hover:text-white hover:bg-navy-light text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>

              {user ? (
                <>
                  {getRoleLinks().map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 rounded text-gray-200 hover:text-white hover:bg-navy-light text-sm font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                  <div className="flex items-center gap-2 px-3 py-2 border-t border-navy-light mt-2 pt-3">
                    {getRoleBadge()}
                    <span className="text-gray-300 text-sm">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-red-300 hover:text-red-200 hover:bg-red-900/30 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded text-gray-200 hover:text-white hover:bg-navy-light text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="block px-3 py-2 rounded bg-saffron text-white text-sm font-semibold text-center" onClick={() => setIsMenuOpen(false)}>
                    Register / File FIR
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}