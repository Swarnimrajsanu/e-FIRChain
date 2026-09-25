import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, CheckCircle, FileText, Search,
  Lock, Users, ChevronRight, BarChart3,
  ArrowRight, Award, Clock
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <FileText className="w-7 h-7" />,
    title: 'File FIR Online',
    description: 'Citizens can securely file First Information Reports online with supporting evidence — anytime, anywhere.',
    color: 'bg-saffron',
  },
  {
    number: '02',
    icon: <Shield className="w-7 h-7" />,
    title: 'Police Verification',
    description: 'Trained officers review and verify FIR details, ensuring accurate categorisation and swift assignment.',
    color: 'bg-navy',
  },
  {
    number: '03',
    icon: <Search className="w-7 h-7" />,
    title: 'Track in Real-Time',
    description: 'Real-time status updates through every stage of the investigation lifecycle via your personal dashboard.',
    color: 'bg-gov-green',
  },
  {
    number: '04',
    icon: <Lock className="w-7 h-7" />,
    title: 'Blockchain Integrity',
    description: 'Every FIR record is cryptographically hashed and anchored on the blockchain — tamper-proof forever.',
    color: 'bg-gold',
  },
];

const stats = [
  { label: 'FIRs Filed', value: '1,24,000+', icon: <FileText className="w-6 h-6" /> },
  { label: 'Cases Resolved', value: '89,400+', icon: <CheckCircle className="w-6 h-6" /> },
  { label: 'Police Stations', value: '15,000+', icon: <Shield className="w-6 h-6" /> },
  { label: 'Citizens Served', value: '2.1 Lakh+', icon: <Users className="w-6 h-6" /> },
];

const firStatuses = [
  { label: 'SUBMITTED', color: 'border-orange-400 text-orange-700 bg-orange-50' },
  { label: 'UNDER REVIEW', color: 'border-blue-400 text-blue-700 bg-blue-50' },
  { label: 'VERIFIED', color: 'border-green-400 text-green-700 bg-green-50' },
  { label: 'ASSIGNED', color: 'border-purple-400 text-purple-700 bg-purple-50' },
  { label: 'INVESTIGATING', color: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
  { label: 'RESOLVED', color: 'border-teal-400 text-teal-700 bg-teal-50' },
  { label: 'CLOSED', color: 'border-gray-400 text-gray-600 bg-gray-50' },
];

const notices = [
  { date: '24 Sep 2026', text: 'New guidelines for online FIR filing under BNS 2023 now applicable.' },
  { date: '20 Sep 2026', text: 'System maintenance scheduled 2:00–4:00 AM IST on Sundays.' },
  { date: '15 Sep 2026', text: 'Mobile app for e-FIRChain now available on iOS & Android.' },
];

export default function Home() {
  return (
    <div className="flex-grow">

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Saffron gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-saffron opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gov-green opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div className="animate-fadeInUp">
              {/* Official tag */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded px-3 py-1.5 mb-6">
                <Award className="w-4 h-4 text-gold" />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">
                  Official National Portal — Government of India
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white font-serif leading-tight mb-4">
                Secure FIR Filing &<br />
                <span className="text-saffron">Blockchain Tracking</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl">
                File your FIR from home, track its progress in real-time, and rest assured
                that your records are tamper-proof — backed by cutting-edge blockchain technology.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/register" className="btn-saffron">
                  <FileText className="w-4 h-4" />
                  File Your FIR Now
                </Link>
                <Link href="/login" className="btn-outline-white">
                  Track Existing FIR
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: <Shield className="w-4 h-4 text-saffron" />, label: 'ISO 27001 Secured' },
                  { icon: <Lock className="w-4 h-4 text-saffron" />, label: 'End-to-End Encrypted' },
                  { icon: <CheckCircle className="w-4 h-4 text-saffron" />, label: 'MHA Certified' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-300 text-sm">
                    {icon}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Emblem + Stats card */}
            <div className="flex flex-col items-center gap-6 animate-fadeInUp-delay-1">
              {/* Big emblem */}
              <div className="relative w-52 h-52 lg:w-64 lg:h-64">
                <Image src="/emblem.png" alt="e-FIRChain Emblem" fill className="object-contain drop-shadow-2xl" priority />
              </div>
              {/* Mini stats pill */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {stats.slice(0, 4).map(({ label, value, icon }) => (
                  <div key={label} className="bg-white/10 border border-white/15 rounded p-3 text-center">
                    <div className="flex justify-center text-saffron mb-1">{icon}</div>
                    <div className="text-white font-bold text-lg">{value}</div>
                    <div className="text-gray-400 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notice Board ───────────────────────────────────────────── */}
      <section className="bg-saffron">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-4">
          <span className="bg-white text-saffron text-xs font-bold px-3 py-1 rounded flex-shrink-0 uppercase tracking-wide">
            Notice
          </span>
          <div className="overflow-hidden flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              {notices.map((n, i) => (
                <p key={i} className="text-white text-sm">
                  <span className="font-bold">[{n.date}]</span>{' '}{n.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-saffron text-sm font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="section-title">How e-FIRChain Works</h2>
            <div className="section-underline mx-auto" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              From filing to resolution — a completely digital, transparent, and secure process
              backed by blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="gov-card p-6 animate-fadeInUp relative" style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-6 bg-saffron rounded-full items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`${step.color} text-white w-12 h-12 rounded flex items-center justify-center mb-4`}>
                  {step.icon}
                </div>
                <div className="text-4xl font-black text-gray-100 mb-2">{step.number}</div>
                <h3 className="font-bold text-navy text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIR Lifecycle Banner ────────────────────────────────────── */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-saffron text-sm font-bold uppercase tracking-widest mb-2">Transparency</p>
            <h2 className="text-3xl font-bold text-white font-serif mb-2">FIR Status Lifecycle</h2>
            <div className="w-14 h-1 bg-saffron rounded mx-auto mb-4" />
            <p className="text-gray-300 max-w-xl mx-auto text-sm">
              Every FIR progresses through clearly defined stages. You are notified at each transition.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3">
            {firStatuses.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`border-2 ${s.color} px-4 py-2 rounded text-xs font-bold tracking-wider whitespace-nowrap`}>
                  {s.label}
                </div>
                {i < firStatuses.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why e-FIRChain ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-saffron text-sm font-bold uppercase tracking-widest mb-2">Why Us</p>
              <h2 className="section-title">Why Choose e-FIRChain?</h2>
              <div className="section-underline" />
              <div className="space-y-5">
                {[
                  {
                    icon: <Lock className="w-5 h-5 text-white" />,
                    bg: 'bg-navy',
                    title: 'Immutable Records',
                    desc: 'Once filed, your FIR is cryptographically sealed on the blockchain. No unauthorized modifications possible.',
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-white" />,
                    bg: 'bg-saffron',
                    title: '24×7 Availability',
                    desc: 'File and track FIRs round the clock from any device. No need to visit the police station.',
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5 text-white" />,
                    bg: 'bg-gov-green',
                    title: 'Real-Time Tracking',
                    desc: 'Get live status updates as your case moves through verification, assignment, and investigation.',
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-white" />,
                    bg: 'bg-gold',
                    title: 'Government Backed',
                    desc: 'Fully integrated with the Ministry of Home Affairs. Legally valid digital FIR receipts provided.',
                  },
                ].map(({ icon, bg, title, desc }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className={`${bg} w-10 h-10 rounded flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1">{title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ label, value, icon }, i) => (
                <div
                  key={label}
                  className={`stat-card animate-fadeInUp`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`stat-icon ${i % 2 === 0 ? 'bg-navy text-white' : 'bg-saffron text-white'}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-navy">{value}</div>
                    <div className="text-gray-500 text-sm">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────────────── */}
      <section className="py-16 bg-off-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-saffron/10 border border-saffron/30 rounded px-3 py-1.5 mb-6">
            <Award className="w-4 h-4 text-saffron" />
            <span className="text-saffron text-xs font-bold uppercase tracking-wider">Start Now — It's Free</span>
          </div>
          <h2 className="section-title mx-auto text-center mb-3">Ready to File Your FIR?</h2>
          <div className="section-underline mx-auto" />
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join over 2 lakh citizens using e-FIRChain for secure, transparent,
            and tamper-proof FIR filing and tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary">
              <FileText className="w-4 h-4" />
              Register & File FIR
            </Link>
            <Link href="/login" className="btn-outline">
              Already Registered? Login
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}