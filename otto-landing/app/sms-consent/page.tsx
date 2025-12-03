"use client";

import React from 'react';

export default function SMSConsentPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Otto</span>
            </a>
            <a 
              href="/" 
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">
          SMS Consent Policy
        </h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            By booking an appointment with Otto AI via phone, you consent to receive transactional text messages confirming your appointment details (date, time, location).
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
            <p className="text-slate-900 font-semibold mb-2">
              What You'll Receive:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Appointment confirmation immediately after booking</li>
              <li>Optional reminder 24 hours before your appointment</li>
              <li>No marketing or promotional content</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
            Your Rights
          </h2>
          <p className="text-slate-700 mb-4">
            You may opt out at any time by replying <strong className="text-slate-900">STOP</strong> to any message. 
            Message and data rates may apply.
          </p>
          <p className="text-slate-700 mb-8">
            To resubscribe after opting out, reply <strong className="text-slate-900">START</strong> or <strong className="text-slate-900">YES</strong> to any message from Otto.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
            Privacy & Security
          </h2>
          <p className="text-slate-700 mb-4">
            Otto AI uses enterprise-grade encryption to protect your personal information. 
            We comply with all applicable privacy regulations including TCPA (Telephone Consumer Protection Act) and GDPR.
          </p>
          <p className="text-slate-700 mb-8">
            Your phone number is only used for appointment-related communications and is never shared with third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
            Message Frequency
          </h2>
          <p className="text-slate-700 mb-8">
            You will receive a maximum of 2 messages per appointment (confirmation + optional reminder). 
            Average frequency: 1-4 messages per month, depending on your booking activity.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">
            Supported Carriers
          </h2>
          <p className="text-slate-700 mb-8">
            Otto AI SMS delivery is supported by all major U.S. carriers including AT&T, Verizon, T-Mobile, Sprint, and regional carriers. 
            Standard messaging rates from your carrier apply.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-12">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Questions or Concerns?
            </h3>
            <p className="text-slate-700 mb-4">
              If you have questions about our SMS consent policy or need assistance, please contact us:
            </p>
            <ul className="space-y-2 text-slate-700">
              <li><strong>Email:</strong> <a href="mailto:support@ottoagent.net" className="text-blue-600 hover:underline">support@ottoagent.net</a></li>
              <li><strong>Phone:</strong> <a href="tel:+18884118568" className="text-blue-600 hover:underline">+1 (888) 411-8568</a></li>
              <li><strong>Text HELP:</strong> Reply HELP to any Otto message for assistance</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 mt-8 rounded-r-lg">
            <p className="text-slate-900 font-semibold mb-2">
              Quick Reference Commands:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li><strong>STOP</strong> - Unsubscribe from all messages</li>
              <li><strong>START</strong> or <strong>YES</strong> - Resubscribe to messages</li>
              <li><strong>HELP</strong> - Get support information</li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Otto AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/sms-consent" className="hover:text-white transition-colors">SMS Consent</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
