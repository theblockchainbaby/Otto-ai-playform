"use client";

import React, { useState } from 'react';

// Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const WrenchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const KeyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
);
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export default function PropertyManagementPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Otto</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="/#industries" className="text-slate-900 font-medium transition-colors">Industries</a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
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
            <a href="/#industries" className="block text-slate-600 font-medium">Industries</a>
            <a href="/#pricing" className="block text-slate-600 font-medium">Pricing</a>
            <button className="w-full bg-emerald-600 text-white px-5 py-3 rounded-lg font-semibold">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-6">
                <HomeIcon className="w-4 h-4" />
                <span>For Property Managers</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Handle Maintenance & Leasing <span className="text-emerald-600">24/7</span>.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Otto triages maintenance requests, schedules showings, and answers tenant questions instantly—so you can focus on growing your portfolio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center">
                  Get Started
                </button>
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                  <PlayIcon className="w-5 h-5 fill-slate-700" />
                  Hear Samples
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                      {i === 3 ? '5k+' : ''}
                    </div>
                  ))}
                </div>
                <p>Units managed with Otto AI</p>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Tenant Call</div>
                      <div className="text-xs text-slate-500">Maintenance Line</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    Urgent
                  </div>
                </div>
                
                {/* Mockup Conversation */}
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                    <p className="text-sm text-slate-700">Property Management, this is Otto. Is this a maintenance emergency?</p>
                  </div>
                  <div className="bg-emerald-600 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto text-white">
                    <p className="text-sm">Yes, my water heater is leaking all over the garage floor!</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                    <p className="text-sm text-slate-700">I understand. I'm dispatching the emergency plumber immediately. Please turn off the main water valve if you can safely do so.</p>
                  </div>
                </div>

                {/* Mockup Action */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <WrenchIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Work Order Created</div>
                    <div className="text-xs text-slate-600">Vendor: Mike's Plumbing (Dispatched)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Maintenance Response", value: "< 30s" },
              { label: "Leasing Inquiries", value: "100%" },
              { label: "After-Hours Calls", value: "24/7" },
              { label: "Vendor Dispatch", value: "Auto" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-extrabold text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Property Automation</h2>
            <p className="text-lg text-slate-600">From 2 AM emergencies to leasing inquiries, Otto handles the calls so your property managers don't have to.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Maintenance Triage', 
                desc: 'Otto troubleshoots issues with tenants ("Is the pilot light on?") before dispatching vendors, saving you money on unnecessary trips.',
                icon: WrenchIcon 
              },
              { 
                title: 'Leasing Assistant', 
                desc: 'Answers questions about available units, pet policies, and rent prices. Pre-qualifies tenants and books showings automatically.',
                icon: KeyIcon 
              },
              { 
                title: 'Emergency Dispatch', 
                desc: 'Recognizes true emergencies (fire, flood, gas) and escalates them immediately while handling routine requests normally.',
                icon: PhoneIcon 
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Samples */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Hear Otto in Action</h2>
            <p className="text-slate-400">Listen to how Otto handles common property management scenarios.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Emergency Maintenance", duration: "0:45", type: "Urgent" },
              { title: "Leasing Inquiry", duration: "1:12", type: "Sales" },
              { title: "Rent Payment Question", duration: "0:38", type: "Support" },
              { title: "Vendor Coordination", duration: "0:55", type: "Ops" }
            ].map((sample, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <PlayIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{sample.title}</div>
                  <div className="text-xs text-slate-400">{sample.type} • {sample.duration}</div>
                </div>
                <div className="px-3 py-1 rounded-full border border-slate-600 text-xs font-medium text-slate-300">
                  Play
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Works With Your Software</h2>
            <p className="text-slate-600">Otto syncs directly with your property management system.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            {['Buildium', 'AppFolio', 'Yardi', 'RentManager', 'Propertyware'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop Taking Calls at 2 AM</h2>
          <p className="text-emerald-100 text-xl mb-10">Let Otto handle the emergencies and leasing calls while you sleep.</p>
          <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg">
            Book a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white tracking-tight">Otto</span>
              <span className="ml-4 text-sm text-slate-500">Property Management Edition</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Otto AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
