import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'File FIR', href: '/file-fir' },
    { name: 'Track Status', href: '/firs' },
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' },
  ];

  const govLinks = [
    { name: 'Government of India', href: 'https://www.india.gov.in', external: true },
    { name: 'Ministry of Home Affairs', href: 'https://www.mha.gov.in', external: true },
    { name: 'National Crime Records Bureau', href: 'https://www.ncrb.gov.in', external: true },
    { name: 'Digital India', href: 'https://www.digitalindia.gov.in', external: true },
  ];

  return (
    <footer className="bg-navy-dark text-white mt-auto">
      {/* Tricolor top border */}
      <div className="tricolor-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image src="/emblem.png" alt="e-FIRChain" fill className="object-contain" />
              </div>
              <div>
                <div className="font-bold text-lg font-serif text-gold">e-FIRChain</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Govt. of India</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A secure, blockchain-powered platform for filing and tracking First Information Reports.
              Bringing transparency and trust to the Indian justice system.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="ticker-dot" />
              <span className="text-green-400 text-xs font-semibold">System Live</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-4 pb-2 border-b border-navy-light">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-saffron text-sm transition-colors flex items-center gap-1.5">
                    <span className="text-saffron">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Gov Links */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-4 pb-2 border-b border-navy-light">
              Government Resources
            </h4>
            <ul className="space-y-2">
              {govLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-saffron text-sm transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3 text-saffron" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-4 pb-2 border-b border-navy-light">
              Contact & Help
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-saffron flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">1800-XXX-XXXX</div>
                  <div className="text-xs">Toll Free Helpline (24×7)</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-saffron flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">support@efirchain.gov.in</div>
                  <div className="text-xs">Grievance Email</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-saffron flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  Ministry of Home Affairs,<br />North Block, New Delhi – 110001
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© 2026 e-FIRChain – Government of India. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Accessibility</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}