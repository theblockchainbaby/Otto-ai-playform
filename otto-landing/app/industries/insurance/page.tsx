"use client";

import React, { useState } from 'react';

// Icons
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export default function InsurancePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-slate-900 tracking-tight">Otto</a>
              <span className="ml-2 px-2 py-0.5 bg-sky-100 text-sky-800 text-xs font-bold rounded-full uppercase tracking-wide">Insurance</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <button className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                Book a Demo
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-slate-900">
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <a href="/#solutions" className="block text-slate-600 font-medium">Solutions</a>
            <a href="/#how-it-works" className="block text-slate-600 font-medium">How it Works</a>
            <a href="/#pricing" className="block text-slate-600 font-medium">Pricing</a>
            <button className="w-full bg-sky-700 text-white px-5 py-3 rounded-lg font-semibold">
              Book a Demo
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-bold mb-6">
                <ShieldIcon className="w-4 h-4" />
                Trusted by Top Agencies
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                The 24/7 AI Agent for <span className="text-sky-600">Modern Agencies.</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Capture every quote request, route claims instantly, and handle policy questions without adding headcount.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-sky-700 hover:bg-sky-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-sky-600/25 flex items-center justify-center">
                  Schedule a Demo
                </button>
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                  <PlayIcon className="w-5 h-5 fill-slate-700" />
                  Hear Live Calls
                </button>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
               <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
                  <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                      <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">New Quote Request</div>
                      <div className="text-sm text-slate-500">Otto AI Agent • Auto & Home</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Thanks for calling Apex Insurance. This is Otto. Are you calling for a new quote or an existing policy?</p>
                    </div>
                    <div className="bg-sky-600 p-3 rounded-lg rounded-tr-none ml-auto text-white max-w-[85%]">
                      <p className="text-sm">I just bought a new car and need to get it insured before I drive off the lot.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Congratulations on the new car! I can help with that immediately. What is the year, make, and model?</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-sky-600 mb-1">100%</div>
              <div className="text-sm text-slate-500 font-medium">Quote Capture</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sky-600 mb-1">0</div>
              <div className="text-sm text-slate-500 font-medium">Hold Times</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sky-600 mb-1">24/7</div>
              <div className="text-sm text-slate-500 font-medium">Claims Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sky-600 mb-1">2x</div>
              <div className="text-sm text-slate-500 font-medium">Retention Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Agency, Always Open</h2>
            <p className="text-lg text-slate-600">Otto handles the routine tasks so your producers can focus on selling and building relationships.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Quote Intake', desc: 'Collects driver info, vehicle details, and coverage needs, then sends a complete lead to your producers.', icon: FileTextIcon },
              { title: 'Claims Routing', desc: 'Triages incoming claims calls. Connects urgent accidents to adjusters and takes messages for minor issues.', icon: ShieldIcon },
              { title: 'Policy Renewals', desc: 'Proactively calls clients to schedule annual reviews, boosting retention and cross-sell opportunities.', icon: UsersIcon },
              { title: 'Certificate Requests', desc: 'Automates COI requests by gathering holder details and notifying your CSRs.', icon: CheckIcon },
              { title: 'Appointment Scheduling', desc: 'Books meetings for policy reviews or life insurance consultations directly on your calendar.', icon: CalendarIcon },
              { title: 'AMS Integration', desc: 'Logs every call and note directly into AMS360, Applied Epic, EZLynx, or HawkSoft.', icon: FileTextIcon },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Samples Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Hear Otto in Action</h2>
            <p className="text-lg text-slate-600">Listen to how Otto handles insurance-specific conversations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "New Auto Quote", desc: "Gathering vehicle and driver information.", icon: FileTextIcon },
              { title: "Claim Status", desc: "Helping a client check on an existing claim.", icon: ShieldIcon },
              { title: "Policy Review", desc: "Scheduling an annual coverage review.", icon: CalendarIcon }
            ].map((sample, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                    <sample.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{sample.title}</h3>
                    <p className="text-xs text-slate-500">{sample.desc}</p>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <PlayIcon className="w-4 h-4 fill-slate-900 ml-0.5" />
                  </div>
                  <div className="h-1 flex-1 bg-slate-300 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-sky-600"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">0:45</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Works With Your Agency Management System</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['AMS360', 'Applied Epic', 'EZLynx', 'HawkSoft', 'Salesforce', 'HubSpot'].map((partner) => (
              <span key={partner} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sky-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Protect Your Book of Business</h2>
          <p className="text-sky-100 text-xl mb-10">Stop losing leads to voicemail and start providing 24/7 service today.</p>
          <button className="bg-white text-sky-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-sky-50 transition-colors shadow-lg">
            Get a Custom Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white tracking-tight">Otto</span>
              <span className="ml-2 text-slate-500">for Insurance</span>
            </div>
            <div className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
