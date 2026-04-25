"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Briefcase, 
  Search, 
  ArrowRight, 
  Star, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  CreditCard,
  HelpCircle,
  Users,
  Wallet,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useEngagements } from "@/hooks/useEngagement";
import { useConsultants } from "@/hooks/useConsultants";
import { cn } from "@/lib/cn";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { engagements } = useEngagements();
  const { consultants } = useConsultants("all");
  
  const activeEngagements = engagements.filter(e => e.status !== 'completed');
  const totalEscrow = engagements.reduce((acc, e) => e.escrowStatus === 'funded' ? acc + (e.totalAmount || 0) : acc, 0);

  if (user?.role === "consultant") {
    return <ConsultantDashboard user={user} engagements={activeEngagements} totalEarnings={54200} />;
  }

  return <OFWDashboard user={user} engagements={activeEngagements} consultants={consultants.slice(0, 3)} totalEscrow={totalEscrow} />;
}

function OFWDashboard({ user, engagements, consultants, totalEscrow }: { user: any, engagements: any[], consultants: any[], totalEscrow: number }) {
  const firstName = user?.displayName?.split(' ')[0] || "Juan";
  
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-4xl font-bold text-rhino">Maligayang pagbabalik, {firstName}.</h1>
            <div className="px-3 py-1 rounded-full bg-desert/10 text-desert text-[10px] font-bold uppercase tracking-wider border border-desert/20">
              {user?.status === "verified" ? "Verified Citizen" : "Recently Repatriated"}
            </div>
          </div>
          <p className="font-body text-rhino/60">
            You have {engagements.length} active engagements in your reintegration plan.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/consultants">
            <Button className="rounded-xl shadow-xl shadow-rhino/5 gap-2 h-14 px-8">
              <Search className="w-4 h-4" />
              Find a Consultant
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats/Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-rhino text-2xl">{engagements.length} Active</h3>
            <p className="font-body text-xs text-rhino/50">Ongoing Engagements</p>
          </div>
          <Link href="/engagements" className="block text-xs font-bold text-desert hover:underline">View All &rarr;</Link>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-rhino text-2xl">₱{totalEscrow.toLocaleString()}</h3>
            <p className="font-body text-xs text-rhino/50">Secured in Escrow</p>
          </div>
          <Link href="/wallet" className="block text-xs font-bold text-desert hover:underline">Manage Wallet &rarr;</Link>
        </div>

        <div className="bg-rhino p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-4 text-white text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-akaroa">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl">Get Started</h3>
            <p className="font-body text-xs text-akaroa/60">Business Reintegration Plan</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full h-10 text-[10px] bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
            Resume Onboarding
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-rhino">Recommended Experts</h2>
            <Link href="/consultants" className="text-sm font-bold text-desert hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {consultants.map((consultant, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-akaroa/10 flex items-center justify-between group hover:border-desert/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-rhino/5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-rhino/5 flex items-center justify-center text-rhino font-bold text-xl">
                    {(consultant.displayName || "?").split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-rhino">{consultant.displayName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[8px] font-bold uppercase tracking-wider">Verified</span>
                    </div>
                    <p className="font-body text-xs text-rhino/50">{consultant.professionalTitle}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-desert">
                        <Star className="w-3 h-3 fill-desert" />
                        4.9
                      </div>
                      <span className="text-[10px] text-rhino/30 font-body">12 reviews</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold">Session Rate</p>
                    <p className="text-sm font-bold text-rhino">₱{consultant.sessionRate?.toLocaleString()}/hr</p>
                  </div>
                  <Link href={`/consultants/${consultant.uid}`}>
                    <Button size="sm" className="rounded-lg h-8 text-[10px] px-4">View</Button>
                  </Link>
                </div>
              </div>
            ))}
            {consultants.length === 0 && (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-akaroa/20">
                <p className="font-body text-rhino/40 text-sm">Finding best matches for your profile...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-rhino/5 rounded-[2.5rem] p-8 border border-akaroa/10 space-y-6 text-left">
            <h2 className="font-heading text-xl font-bold text-rhino">Next Milestone</h2>
            
            {engagements.length > 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-akaroa/10 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] text-desert font-bold uppercase tracking-widest">In Progress</p>
                    <h4 className="font-heading font-bold text-rhino text-sm">{engagements[0].title}</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rhino text-white flex items-center justify-center text-[10px] font-bold">
                    {(engagements[0].title || "?")[0]}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-rhino/40 uppercase tracking-widest">
                    <span>Task Progress</span>
                    <span>30%</span>
                  </div>
                  <div className="h-1.5 w-full bg-rhino/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rhino w-[30%]" />
                  </div>
                </div>

                <Link href={`/engagements/${engagements[0].id}`} className="block">
                  <Button fullWidth variant="ghost" size="sm" className="h-10 text-xs rounded-xl">View Details</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-akaroa/10 text-center space-y-4">
                <p className="text-xs text-rhino/40 font-body">No active engagements yet.</p>
                <Link href="/consultants">
                  <Button size="sm" className="h-10 rounded-xl w-full">Browse Experts</Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="bg-desert rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden group text-left">
            <div className="relative z-10 space-y-2">
              <h3 className="font-heading font-bold text-lg">Need help urgently?</h3>
              <p className="text-xs text-white/70 leading-relaxed font-body">
                Our 24/7 support line is available for OFWs in crisis situations.
              </p>
              <Button variant="ghost" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 text-xs mt-2 rounded-xl">
                Talk to Support
              </Button>
            </div>
            <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsultantDashboard({ user, engagements, totalEarnings }: { user: any, engagements: any[], totalEarnings: number }) {
  const firstName = user?.displayName?.split(' ')[0] || "Consultant";

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-4xl font-bold text-rhino">Good morning, {firstName}.</h1>
            <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-200">
              Active Consultant
            </div>
          </div>
          <p className="font-body text-rhino/60">
            You have {engagements.length} active clients to manage today.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button className="rounded-xl shadow-xl shadow-rhino/5 gap-2 h-14 px-8">
            <Calendar className="w-4 h-4" />
            Manage Schedule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Active Clients</p>
            <h3 className="font-heading font-bold text-rhino text-2xl">{engagements.length}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Total Earnings</p>
            <h3 className="font-heading font-bold text-rhino text-2xl">₱{totalEarnings.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-akaroa/10 shadow-sm space-y-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Average Rating</p>
            <h3 className="font-heading font-bold text-rhino text-2xl">4.9</h3>
          </div>
        </div>

        <div className="bg-rhino p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4 text-white text-left">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-akaroa">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-akaroa/40 font-bold uppercase tracking-widest">Verified Status</p>
            <h3 className="font-heading font-bold text-white text-2xl uppercase tracking-wider">{user.status}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-heading text-2xl font-bold text-rhino text-left">Active Client Feed</h2>
          <div className="space-y-4">
            {engagements.map((engagement, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-akaroa/10 flex items-center justify-between group hover:border-desert/30 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rhino text-white flex items-center justify-center font-bold">
                    {(engagement.title || "?")[0]}
                  </div>
                  <div className="text-left">
                    <h4 className="font-heading font-bold text-rhino">{engagement.title || "Untitled Engagement"}</h4>
                    <p className="font-body text-xs text-rhino/50 capitalize">{engagement.category} • {engagement.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-3 py-1 rounded-full",
                    engagement.status === 'in_progress' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                  )}>
                    {engagement.status.replace('_', ' ')}
                  </span>
                  <Link href={`/engagements/${engagement.id}`}>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {engagements.length === 0 && (
              <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-akaroa/20">
                <p className="font-body text-rhino/40">No active clients at the moment.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-rhino text-left">Recent Activity</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-akaroa/10 space-y-4 text-left">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rhino font-heading">System Update</p>
                  <p className="text-[10px] text-rhino/50 font-body">Welcome to your professional command center.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
