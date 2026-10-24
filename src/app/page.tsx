"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  LogOut,
  Clock,
  RotateCw,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import ComplaintForm from "@/components/ComplaintForm";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"register" | "overview">("register");

  // Sample recent activity for timeline
  const recentActivities = [
    {
      title: "Complaint registered",
      id: "CMP-20261023-A7K92",
      time: "2 hours ago",
      color: "bg-emerald-500",
    },
    {
      title: "Status updated to In Progress",
      id: "CMP-20261020-002",
      time: "3 days ago",
      color: "bg-blue-600",
    },
    {
      title: "Complaint resolved",
      id: "CMP-20261018-003",
      time: "5 days ago",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header Bar matching user's Complaint Portal screenshot */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Brand: IT Academics */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                IT Academics
              </h1>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Complaint Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">Official Student &amp; Staff Grievance Redressal</p>
          </div>
        </div>

        {/* Tab switchers in header */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + New Complaint
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Portal Summary
          </button>
          <Link
            href="/track"
            className="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Status</span>
          </Link>
        </div>

        {/* Admin Login Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0A1128] text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner matching screenshot: "Hello, Rahul Kumar / Here's your complaint summary" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, IT Academics Member
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Welcome to the official IT Academics complaint and redressal system.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("register")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Complaint</span>
            </button>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Track with ID</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Complaints */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Grievances</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">24/7</h3>
            </div>
          </div>

          {/* Open */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#D97706]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Fast Triage</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">&lt; 24h</h3>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
              <RotateCw className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Email Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Automated</h3>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-[#059669]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Security</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Firebase</h3>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Form/Overview + Right Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Pane (8 cols) */}
          <div className="lg:col-span-8">
            {activeTab === "register" ? (
              <ComplaintForm />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="py-3 px-3">Complaint ID</th>
                        <th className="py-3 px-3">Subject</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Submitted On</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">CMP-20251023-001</td>
                        <td className="py-3 px-3">Product quality issue</td>
                        <td className="py-3 px-3">IT Academics Course Material</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E]">
                            Open
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">23 Oct 2025, 10:24 AM</td>
                        <td className="py-3 px-3 text-right">
                          <Link href="/track?id=CMP-20251023-001" className="text-blue-600 font-bold hover:underline">
                            View &gt;
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">CMP-20251020-002</td>
                        <td className="py-3 px-3">Delivery delay</td>
                        <td className="py-3 px-3">Hardware Kit</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#6D28D9]">
                            In Progress
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">20 Oct 2025, 04:12 PM</td>
                        <td className="py-3 px-3 text-right">
                          <Link href="/track?id=CMP-20251020-002" className="text-blue-600 font-bold hover:underline">
                            View &gt;
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane (4 cols) matching screenshot */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Quick Actions</span>
              </h3>

              <button
                onClick={() => {
                  setActiveTab("register");
                  window.scrollTo({ top: 250, behavior: "smooth" });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Register New Complaint</span>
              </button>

              {/* Blue Info Callout matching screenshot */}
              <div className="bg-[#EFF6FF] border border-blue-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Keep your Complaint ID safe</p>
                  <p className="text-blue-700 mt-0.5 leading-relaxed">
                    You can use it to check the status of your complaint anytime without logging in.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Recent Activity matching screenshot */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Your Recent Activity</span>
              </h3>

              <div className="space-y-4 pt-1">
                {recentActivities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1 shrink-0`}></span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 leading-tight">{act.title}</p>
                      <p className="font-mono text-[11px] text-slate-500 mt-0.5">{act.id}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Track Box */}
            <div className="bg-gradient-to-br from-[#0A1128] to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-white">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Track Existing Grievance</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your reference ID to view real-time department updates and administrative notes.
              </p>
              <Link
                href="/track"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Track Complaint Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} IT Academics. All rights reserved. Powered by Firebase Cloud Firestore.</p>
        </footer>
      </div>
    </div>
  );
}
