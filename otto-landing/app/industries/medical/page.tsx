"use client";

import React, { useState } from 'react';

// Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
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
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export default function MedicalPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Otto</span>
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">Medical</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="/#industries" className="text-slate-900 font-medium transition-colors">Industries</a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
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
            <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                <ShieldIcon className="w-4 h-4" />
                HIPAA Compliant
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                The AI Receptionist for <span className="text-blue-600">Modern Medical Practices</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Triage patients, schedule appointments directly into your EHR, and answer common questions 24/7—securely and compassionately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center">
                  Schedule a Demo
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
                      {i === 3 ? '10k+' : ''}
                    </div>
                  ))}
                </div>
                <p>Patients supported daily</p>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
               <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
                  <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Dr. Chen's Office</div>
                      <div className="text-sm text-slate-500">Otto AI Assistant</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">Thank you for calling Dr. Chen's Family Practice. Are you calling to schedule an appointment or for a prescription refill?</p>
                    </div>
                    <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none ml-auto text-white max-w-[85%]">
                      <p className="text-sm">I need to bring my son in, he has a fever.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm text-slate-700">I understand. Is this for a new patient or existing patient? And how high is the fever currently?</p>
                    </div>
                  </div>
                  
                  {/* Mockup Action */}
                  <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <ActivityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Triage: Urgent Care</div>
                      <div className="text-xs text-slate-600">Flagged for Nurse Line</div>
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
              { label: "Hold Time", value: "0 min" },
              { label: "Patient Satisfaction", value: "98%" },
              { label: "Admin Hours Saved", value: "25/wk" },
              { label: "Data Security", value: "HIPAA" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-extrabold text-blue-600 mb-1">{stat.value}</div>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Healthcare</h2>
            <p className="text-lg text-slate-600">Otto handles the front desk so your staff can focus on patient care.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Intelligent Triage', 
                desc: 'Otto asks key screening questions to prioritize urgent cases and route them immediately to nursing staff.',
                icon: ActivityIcon
              },
              { 
                title: 'EHR Integration', 
                desc: 'Seamlessly syncs with Epic, Cerner, DrChrono, and other major EHR systems for real-time scheduling.',
                icon: FileTextIcon
              },
              { 
                title: 'Secure & Private', 
                desc: 'Fully HIPAA compliant architecture ensures patient data is protected at every step of the conversation.',
                icon: ShieldIcon
              },
              { 
                title: 'After-Hours Support', 
                desc: 'Capture appointments and handle inquiries when the office is closed, reducing Monday morning backlog.',
                icon: PhoneIcon
              },
              { 
                title: 'Prescription Refills', 
                desc: 'Collects pharmacy details and medication info to queue refill requests for provider approval.',
                icon: CheckIcon
              },
              { 
                title: 'Appointment Reminders', 
                desc: 'Reduces no-shows with automated confirmation calls and texts.',
                icon: CalendarIcon
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
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
            <p className="text-slate-400">Listen to how Otto handles common patient scenarios.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "New Patient Scheduling", duration: "1:15", type: "Booking" },
              { title: "Symptom Triage", duration: "0:55", type: "Urgent" },
              { title: "Prescription Refill", duration: "0:45", type: "Admin" },
              { title: "Insurance Verification", duration: "1:05", type: "Billing" }
            ].map((sample, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Works With Your EHR</h2>
            <p className="text-slate-600">Otto syncs directly with the systems you use every day.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            {['Epic', 'Cerner', 'DrChrono', 'AthenaHealth', 'Kareo', 'eClinicalWorks'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Transform Your Patient Experience</h2>
          <p className="text-blue-100 text-xl mb-10">Join leading clinics using Otto to reduce wait times and improve staff satisfaction.</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
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
              <span className="ml-2 text-slate-500">for Medical</span>
            </div>
            <div className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
