"use client";

import React, { useState } from 'react';

// Icons
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const KeyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
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
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

export default function RealEstatePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-slate-900 tracking-tight">Otto</a>
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full uppercase tracking-wide">Real Estate</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <button className="bg-indigo-900 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
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
            <button className="w-full bg-indigo-900 text-white px-5 py-3 rounded-lg font-semibold">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold mb-6">
                <TrendingUpIcon className="w-4 h-4" />
                The #1 AI ISA for Top Producers
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Never Lose a Lead to <span className="text-indigo-600">Zillow</span> Again.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Otto calls your leads within seconds, qualifies buyers & sellers, and books showings directly to your calendar—24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-indigo-900 hover:bg-indigo-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-900/25 flex items-center justify-center">
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
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Incoming Lead</div>
                      <div className="text-sm text-slate-500">Otto AI ISA • Zillow Concierge</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Hi, this is Otto with Luxury Living. I saw you were looking at 123 Main St. Are you looking to buy soon?</p>
                    </div>
                    <div className="bg-indigo-600 p-3 rounded-lg rounded-tr-none ml-auto text-white max-w-[85%]">
                      <p className="text-sm">Yes, we're hoping to move before the school year starts. Do you have time to show it?</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Absolutely. I have an opening this Saturday at 10 AM or 2 PM. Which works best for you?</p>
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
              <div className="text-3xl font-bold text-indigo-600 mb-1">&lt; 1 Min</div>
              <div className="text-sm text-slate-500 font-medium">Speed to Lead</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-1">24/7</div>
              <div className="text-sm text-slate-500 font-medium">Lead Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-1">3x</div>
              <div className="text-sm text-slate-500 font-medium">Conversion Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-1">100%</div>
              <div className="text-sm text-slate-500 font-medium">CRM Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for High-Volume Teams</h2>
            <p className="text-lg text-slate-600">Otto handles the grunt work—qualifying, chasing, and booking—so you only talk to serious buyers and sellers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Lead Response', desc: 'Calls new leads from Zillow, Realtor.com, and Facebook Ads within seconds of submission.', icon: PhoneIcon },
              { title: 'Buyer Qualification', desc: 'Confirms budget, timeframe, pre-approval status, and specific property criteria.', icon: HomeIcon },
              { title: 'Seller Intake', desc: 'Gathers property details, motivation to sell, and timeline before transferring to you.', icon: KeyIcon },
              { title: 'Showing Scheduling', desc: 'Books property tours directly to your calendar, avoiding double bookings.', icon: CalendarIcon },
              { title: 'Open House RSVP', desc: 'Follows up with open house visitors to gather feedback and gauge interest.', icon: CheckIcon },
              { title: 'CRM Integration', desc: 'Syncs every conversation and appointment to Follow Up Boss, kvCORE, LionDesk, and more.', icon: TrendingUpIcon },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
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
            <p className="text-lg text-slate-600">Listen to how Otto sounds handling real estate scenarios.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Zillow Lead Response", desc: "Calling a lead 30 seconds after inquiry.", icon: PhoneIcon },
              { title: "Seller Valuation", desc: "Qualifying a homeowner interested in selling.", icon: HomeIcon },
              { title: "Showing Request", desc: "Booking a tour for a qualified buyer.", icon: CalendarIcon }
            ].map((sample, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
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
                    <div className="w-1/3 h-full bg-indigo-600"></div>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Works With Your Stack</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Follow Up Boss', 'kvCORE', 'LionDesk', 'BoomTown', 'Salesforce', 'HubSpot'].map((partner) => (
              <span key={partner} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stop Chasing Leads. Start Closing Deals.</h2>
          <p className="text-indigo-100 text-xl mb-10">Let Otto handle the follow-up so you can focus on showings and negotiations.</p>
          <button className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
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
              <span className="ml-2 text-slate-500">for Real Estate</span>
            </div>
            <div className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
