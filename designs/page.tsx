"use client";

import React, { useState } from 'react';

// Simple Icon Components to avoid external dependencies
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

export default function OttoLandingPage() {
	  const [isMenuOpen, setIsMenuOpen] = useState(false);
	  const [isChatOpen, setIsChatOpen] = useState(false);
	  const [chatInput, setChatInput] = useState('');
	  const [isChatLoading, setIsChatLoading] = useState(false);
	  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
	    { role: 'assistant', content: "Hi, I'm Otto. Ask me anything about the product or setup." },
	  ]);

	  async function handleSend(e: React.FormEvent) {
	    e.preventDefault();
	    if (!chatInput.trim()) return;

	    const userMsg = { role: 'user' as const, content: chatInput.trim() };
	    setChatMessages(prev => [...prev, userMsg]);
	    setChatInput('');
	    setIsChatLoading(true);

	    try {
	      const res = await fetch('/api/chat', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({ messages: [...chatMessages, userMsg] }),
	      });

	      if (!res.ok) throw new Error('Chat request failed');

	      const data = await res.json();
	      const reply = data.reply || data.message || 'Sorry, I could not generate a response.';
	      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
	    } catch (err) {
	      console.error(err);
	      setChatMessages(prev => [
	        ...prev,
	        { role: 'assistant', content: 'Sorry, something went wrong talking to the AI. Please try again.' },
	      ]);
	    } finally {
	      setIsChatLoading(false);
	    }
	  }

	  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Otto</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#solutions" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Solutions</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="#industries" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Industries</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">FAQs</a>
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
            <a href="#solutions" className="block text-slate-600 font-medium">Solutions</a>
            <a href="#how-it-works" className="block text-slate-600 font-medium">How it Works</a>
            <a href="#industries" className="block text-slate-600 font-medium">Industries</a>
            <a href="#pricing" className="block text-slate-600 font-medium">Pricing</a>
            <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold">
              Book a Demo
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Never Miss Another <span className="text-blue-600">Call</span> or <span className="text-blue-600">Lead</span> Again.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed">
                Otto answers every call, qualifies every lead, and books appointments directly to your calendar—24/7, without adding staff.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center">
                  Book a Demo
                </button>
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                  <PlayIcon className="w-5 h-5 fill-slate-700" />
                  2-Minute Overview
                </button>
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <span className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
                </span>
                Used by clinics, law firms, realtors, and home service pros.
              </p>
            </div>
            
            {/* Hero Visual */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Incoming Call</div>
                      <div className="text-xs text-slate-500">Otto AI Agent Active</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Live
                  </div>
                </div>
                
                {/* Mockup Conversation */}
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                    <p className="text-sm text-slate-700">Thanks for calling Dr. Smith's office. This is Otto. How can I help you today?</p>
                  </div>
                  <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto text-white">
                    <p className="text-sm">Hi, I'd like to book a consultation for next Tuesday.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                    <p className="text-sm text-slate-700">I can help with that. We have an opening at 2:00 PM or 4:30 PM on Tuesday. Which works better?</p>
                  </div>
                </div>

                {/* Mockup Action */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Appointment Booked</div>
                    <div className="text-xs text-slate-600">Synced to Google Calendar</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Trusted by teams in</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Healthcare', 'Real Estate', 'Home Services', 'Legal', 'Insurance'].map((industry) => (
              <span key={industry} className="text-xl font-bold text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Otto Handles For You</h2>
            <p className="text-lg text-slate-600">More than just an answering service—Otto is a full-cycle workflow automation agent.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: '24/7 Call Answering', desc: 'Never let a call go to voicemail. Otto answers instantly, day or night.', icon: PhoneIcon },
              { title: 'Lead Qualification', desc: 'Otto asks the right questions to filter spam and prioritize high-value leads.', icon: CheckIcon },
              { title: 'Booking & Reminders', desc: 'Directly books slots in your calendar and sends SMS reminders automatically.', icon: CalendarIcon },
              { title: 'Intake & Data Entry', desc: 'Collects caller info and syncs it instantly to your CRM or database.', icon: MenuIcon },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Before Otto</h2>
            <p className="text-slate-400 text-lg">The hidden costs of manual phone handling.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Missed Calls = Lost Revenue', desc: '62% of calls to small businesses go unanswered. Every missed call is a customer going to a competitor.' },
              { title: 'Staff Burnout', desc: 'Your team is interrupted constantly. Receptionists are overwhelmed, and high-value staff are stuck on the phone.' },
              { title: 'Slow Follow-Up', desc: 'Leads go cold within minutes. If you aren\'t answering instantly, you\'re losing the deal.' },
            ].map((pain, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                <div className="text-red-400 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{pain.title}</h3>
                <p className="text-slate-400">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Teams Choose Otto</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Always-on AI receptionist",
              "Industry-tuned conversation flows",
              "Connects to your calendar & CRM",
              "Fast setup & white-glove support"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1 bg-green-100 rounded-full p-1">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-lg font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Otto Works in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

            {[
              { step: 1, title: 'Connect', desc: 'Link your phone number and calendar in minutes.' },
              { step: 2, title: 'Customize', desc: 'Choose your industry script and set your preferences.' },
              { step: 3, title: 'Go Live', desc: 'Turn on Otto and watch your appointments fill up.' },
            ].map((item) => (
              <div key={item.step} className="text-center bg-slate-50">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-blue-600 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Results You Can Expect</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { metric: "+30–50%", label: "More Booked Appointments" },
              { metric: "60%", label: "Fewer Missed Calls" },
              { metric: "10hrs+", label: "Saved Per Week" },
              { metric: "24/7", label: "Instant Response Time" },
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-blue-50 rounded-2xl text-center">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">{stat.metric}</div>
                <div className="font-medium text-slate-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Otto for Your Industry</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Otto comes pre-trained with workflows and scripts designed specifically for your vertical.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { name: "Medical Clinics", desc: "Triage patients, book appointments, and handle FAQs securely." },
              { name: "Med-Spas", desc: "Capture high-value cosmetic leads and reduce no-shows." },
              { name: "Real Estate", desc: "Qualify buyers/sellers instantly and route hot leads to agents." },
              { name: "Home Services", desc: "Book HVAC, plumbing, and electrical jobs while you're in the field." },
              { name: "Insurance", desc: "Route claims, quote requests, and policy questions efficiently." },
              { name: "Law Firms", desc: "Professional intake for potential clients 24/7." },
              { name: "Property Mgmt", desc: "Handle tenant maintenance requests and leasing inquiries." },
            ].map((ind, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{ind.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{ind.desc}</p>
                <a href="#" className="text-blue-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  View industry page <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple Pricing</h2>
            <p className="text-slate-600">Transparent plans that grow with your business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="border border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">$499<span className="text-lg font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['500 Minutes Included', '1 Phone Number', 'Standard Workflows', 'Email Support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                Talk to Sales
              </button>
            </div>

            {/* Growth */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 relative shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Growth</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">$999<span className="text-lg font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['1,500 Minutes Included', '3 Phone Numbers', 'Advanced Workflows', 'CRM Integration', 'Priority Support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Talk to Sales
              </button>
            </div>

            {/* Scale */}
            <div className="border border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Scale</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">$1,999<span className="text-lg font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['Unlimited Minutes', 'Unlimited Numbers', 'Custom Workflows', 'Dedicated Account Mgr', 'API Access'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Teams Say About Otto</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "We used to miss 10 calls a day. Now Otto catches everything and our calendar is full.", author: "Sarah J.", role: "Clinic Manager", industry: "Healthcare" },
              { quote: "It sounds incredibly human. Clients have no idea they're talking to AI until the appointment is booked.", author: "Mike T.", role: "Owner", industry: "HVAC Services" },
              { quote: "The ROI was immediate. We saved $4k/month on staffing costs in the first month alone.", author: "Elena R.", role: "Broker", industry: "Real Estate" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                </div>
                <p className="text-slate-700 mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-slate-900">{t.author}</div>
                  <div className="text-sm text-slate-500">{t.role}, {t.industry}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to put your incoming calls on autopilot?</h2>
          <p className="text-blue-100 text-xl mb-10">Join hundreds of businesses saving time and money with Otto.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Book a Demo
            </button>
            <a href="#industries" className="text-white font-semibold hover:underline">
              See how Otto works for your industry
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: "How long does setup take?", a: "Most accounts are live within 24-48 hours. We handle the initial configuration and script setup for you." },
              { q: "Does it integrate with my calendar?", a: "Yes! Otto connects natively with Google Calendar, Outlook, Calendly, and many industry-specific CRMs." },
              { q: "Can I customize the script?", a: "Absolutely. We start with industry-proven templates, but you can tailor the conversation flow, tone, and specific answers to your needs." },
              { q: "What happens if Otto doesn't know the answer?", a: "You can set up fallback rules. Otto can take a message, transfer the call to a human, or direct the caller to your website." },
              { q: "Is my data secure?", a: "Yes. We use enterprise-grade encryption and comply with major privacy regulations including HIPAA for medical clients." },
            ].map((item, i) => (
              <div key={i} className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold text-white tracking-tight mb-4 block">Otto</span>
              <p className="text-sm">AI Receptionists for Real-World Businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Healthcare</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Real Estate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Home Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
            <p className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-white">X</span>
              <span className="cursor-pointer hover:text-white">LinkedIn</span>
              <span className="cursor-pointer hover:text-white">YouTube</span>
            </div>
          </div>
        </div>
      </footer>

	      {/* Floating Chatbot Widget */}
	      <div className="fixed bottom-4 right-4 z-50">
	        <button
	          type="button"
	          onClick={() => setIsChatOpen(prev => !prev)}
	          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
	        >
	          <span>Chat with Otto</span>
	          <ChevronDownIcon
	            className={`w-4 h-4 transition-transform ${isChatOpen ? 'rotate-180' : ''}`}
	          />
	        </button>

	        {isChatOpen && (
	          <div className="mt-3 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
	            <div className="px-4 py-3 border-b border-slate-200">
	              <p className="text-sm font-semibold text-slate-900">Otto Chat</p>
	              <p className="text-xs text-slate-500">Ask anything about Otto or this page.</p>
	            </div>
	            <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto text-sm">
	              {chatMessages.map((m, i) => (
	                <div
	                  key={i}
	                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
	                    m.role === 'assistant'
	                      ? 'bg-slate-100 text-slate-800'
	                      : 'ml-auto bg-blue-600 text-white'
	                  }`}
	                >
	                  {m.content}
	                </div>
	              ))}
	              {isChatLoading && (
	                <div className="text-xs text-slate-400">Thinking…</div>
	              )}
	            </div>
	            <form
	              onSubmit={handleSend}
	              className="px-4 py-3 border-t border-slate-200 flex gap-2"
	            >
	              <input
	                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	                placeholder="Ask a question…"
	                value={chatInput}
	                onChange={e => setChatInput(e.target.value)}
	              />
	              <button
	                type="submit"
	                disabled={isChatLoading || !chatInput.trim()}
	                className="px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white disabled:opacity-50"
	              >
	                Send
	              </button>
	            </form>
	          </div>
	        )}
	      </div>
    </div>
  );
}
