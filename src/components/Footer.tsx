import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2 text-white">
              <ShieldCheck className="w-6 h-6 text-primary-400" />
              <span className="font-bold text-lg text-white">Grievance & Support Portal</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A secure, transparent, and prompt grievance redressal platform. Registered complaints are tracked end-to-end with real-time updates and notifications.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </span>
              <span>•</span>
              <span>Encrypted Firebase Cloud Storage</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Lodge Complaint
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Track Grievance Status
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Staff & Admin Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Support Helpdesk</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@institution.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="text-xs text-slate-400 mt-2">
                Mon - Fri: 9:00 AM - 5:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Official Complaint Redressal Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by Next.js & Firebase Cloud Firestore</p>
        </div>
      </div>
    </footer>
  );
}
