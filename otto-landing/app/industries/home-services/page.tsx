"use client";

import React, { useState } from 'react';

// Icons
const WrenchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);
const TruckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
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
const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default function HomeServicesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-slate-900 tracking-tight">Otto</a>
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wide">Home Services</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
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
            <button className="w-full bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-bold mb-6">
                <WrenchIcon className="w-4 h-4" />
                Built for HVAC, Plumbing & Electrical
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Book Jobs While You're <span className="text-orange-600">On The Job.</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Stop letting calls go to voicemail while you're under a sink or on a roof. Otto answers 24/7, quotes jobs, and dispatches your crew.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center">
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
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Emergency Call</div>
                      <div className="text-sm text-slate-500">Otto AI Dispatcher</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Thanks for calling Mike's Plumbing. This is Otto. Do you have an emergency?</p>
                    </div>
                    <div className="bg-orange-600 p-3 rounded-lg rounded-tr-none ml-auto text-white max-w-[85%]">
                      <p className="text-sm">Yeah, my water heater just burst and my basement is flooding!</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">I understand, that's urgent. I'm dispatching our on-call technician to your address now. Can you turn off the main water valve while you wait?</p>
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
              <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
              <div className="text-sm text-slate-500 font-medium">Missed Emergencies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
              <div className="text-sm text-slate-500 font-medium">Dispatch Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">+40%</div>
              <div className="text-sm text-slate-500 font-medium">More Jobs Booked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">&lt;30s</div>
              <div className="text-sm text-slate-500 font-medium">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Hardest Working Crew Member</h2>
            <p className="text-lg text-slate-600">Otto handles the phones so your techs can handle the tools. No more playing phone tag or losing jobs to competitors who answered first.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Emergency Dispatch', desc: 'Identifies urgent issues (leaks, no heat) and routes them to your on-call tech immediately.', icon: AlertIcon },
              { title: 'Job Scheduling', desc: 'Books service windows directly into your calendar based on technician availability.', icon: CalendarIcon },
              { title: 'Quote Collection', desc: 'Gathers job details, photos, and requirements so you can quote accurately before driving out.', icon: WrenchIcon },
              { title: 'Service Area Check', desc: 'Verifies the customer is within your service radius before booking the job.', icon: TruckIcon },
              { title: 'After-Hours Coverage', desc: 'Captures late-night emergency calls without waking you up unless it\'s a real emergency.', icon: PhoneIcon },
              { title: 'CRM Sync', desc: 'Pushes customer data and job notes directly to ServiceTitan, Housecall Pro, or Jobber.', icon: CheckIcon },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4">
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
            <p className="text-lg text-slate-600">Listen to how Otto handles common home service scenarios.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Emergency HVAC", desc: "Handling a 'no heat' call at 2 AM.", icon: AlertIcon },
              { title: "Plumbing Quote", desc: "Gathering details for a water heater replacement.", icon: WrenchIcon },
              { title: "Routine Maintenance", desc: "Booking a seasonal AC tune-up.", icon: CalendarIcon }
            ].map((sample, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
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
                    <div className="w-1/3 h-full bg-orange-600"></div>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Works With Your Field Software</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldEdge', 'Workiz'].map((partner) => (
              <span key={partner} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Your Nights & Weekends Back</h2>
          <p className="text-orange-100 text-xl mb-10">Let Otto handle the phones while you handle the business.</p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg">
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
              <span className="ml-2 text-slate-500">for Home Services</span>
            </div>
            <div className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
