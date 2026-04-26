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
  Calendar,
  BrainCircuit,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useEngagements } from "@/hooks/useEngagement";
import { useConsultants } from "@/hooks/useConsultants";
import { cn } from "@/lib/cn";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { engagements } = useEngagements();
  const { consultants } = useConsultants(user?.goal, user?.province);
  
  const activeEngagements = engagements.filter(e => e.status !== 'COMPLETED');
  const totalEscrow = engagements.reduce((acc, e) => e.escrowStatus === 'funded' ? acc + (e.totalAmount || 0) : acc, 0);

  if (user?.role === "consultant") {
    return <ConsultantDashboard user={user} engagements={activeEngagements} totalEarnings={54200} />;
  }

  return <OFWDashboard user={user} engagements={activeEngagements} consultants={consultants} totalEscrow={totalEscrow} />;
}

function OFWDashboard({ user, engagements, consultants, totalEscrow }: { user: any, engagements: any[], consultants: any[], totalEscrow: number }) {
  const firstName = user?.displayName?.split(' ')[0] || "Juan";
  const hasActiveProject = engagements.length > 0;
  
  const localMatches = consultants.filter(c => c.areaOfOperation === user?.province);
  const otherMatches = consultants.filter(c => c.areaOfOperation !== user?.province);

  const categories = [
    { label: "Business", goal: "business", status: "none" },
    { label: "Redeployment", goal: "redeployment", status: "none" },
    { label: "General", goal: "general", status: "none" },
    { label: "Benefits", goal: "benefits", status: "none" },
    { label: "Retirement", goal: "retirement", status: "none" },
    { label: "Reintegration", goal: "reintegration", status: "none" },
  ];

  // Map active engagements to categories
  engagements.forEach(e => {
    const cat = categories.find(c => c.goal === e.category?.toLowerCase());
    if (cat) cat.status = e.status === 'completed' ? 'completed' : 'active';
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome & Global Status */}
      <div className="bg-rhino p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-rhino/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 text-left max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-5xl font-bold">Kamusta, {firstName}.</h1>
              <div className="px-3 py-1 rounded-full bg-desert text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Active Partner
              </div>
            </div>
            <p className="text-akaroa/60 font-body text-lg leading-relaxed">
              Your reintegration journey is mapped across {engagements.length} strategic projects. You have <strong>₱{totalEscrow.toLocaleString()}</strong> secured in the Sundo Vault.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-desert" />
                <span className="text-xs font-bold font-body">{engagements.length} Secured Engagements</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-desert" />
                <span className="text-xs font-bold font-body">Next Review: Today</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0">
            <Link href="/consultants">
              <Button className="bg-desert hover:bg-walnut text-white h-20 px-12 rounded-[2rem] shadow-2xl shadow-black/20 font-bold text-xl group transition-all hover:scale-105">
                New Consultation <Plus className="w-6 h-6 ml-2 group-hover:rotate-90 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-desert/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Reintegration Command Center */}
        <div className="lg:col-span-2 space-y-10">
          {/* AI Reintegration Insight */}
          <div className="bg-white p-10 rounded-[3rem] border-2 border-desert/10 shadow-xl shadow-desert/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit className="w-24 h-24 text-desert" />
            </div>
            <div className="relative z-10 space-y-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-desert/10 flex items-center justify-center text-desert">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-rhino text-2xl">AI Progress Insight</h3>
              </div>
              <div className="p-6 rounded-2xl bg-rhino/5 border-l-4 border-desert space-y-4">
                <p className="font-body text-rhino/70 italic leading-relaxed">
                  &ldquo;Based on your active consultations in <strong>Business</strong> and <strong>Benefits</strong>, you are currently 65% through your Phase 1 roadmap. Your Expert partners have verified 4 critical deliverables this week. We recommend reviewing the 'Site Inspection' task in your Business project.&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 h-2 bg-rhino/10 rounded-full overflow-hidden">
                    <div className="h-full bg-desert w-[65%]" />
                  </div>
                  <span className="text-xs font-bold text-rhino font-heading">65% Overall</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Status Matrix */}
          <div className="bg-white p-10 rounded-[3rem] border border-akaroa/10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-rhino text-2xl">Execution Status</h3>
              <span className="px-3 py-1 rounded-full bg-rhino/5 text-rhino/30 text-[10px] font-bold uppercase tracking-widest">Across All Projects</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.label} className={cn(
                  "p-8 rounded-[2.5rem] border transition-all text-left space-y-4 relative group",
                  cat.status === 'active' ? "bg-desert/5 border-desert/20 shadow-lg shadow-desert/5" : 
                  cat.status === 'completed' ? "bg-green-50 border-green-100 shadow-lg shadow-green-500/5" :
                  "bg-rhino/5 border-transparent opacity-60"
                )}>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-rhino/30 uppercase tracking-widest">{cat.label}</p>
                    {cat.status === 'active' && <div className="w-2 h-2 rounded-full bg-desert animate-ping" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rhino">{cat.status === 'none' ? 'Dormant' : 'Active Partner'}</p>
                    <span className={cn(
                      "inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded-md",
                      cat.status === 'active' ? "bg-desert text-white" :
                      cat.status === 'completed' ? "bg-green-600 text-white" :
                      "bg-rhino/10 text-rhino/40"
                    )}>
                      {cat.status === 'active' ? 'Secured' : cat.status === 'completed' ? 'Success' : 'Ready'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-8 text-left">
          {/* Quick Actions */}
          <div className="bg-rhino rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-rhino/30 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <h3 className="font-heading text-2xl font-bold">Secure Vault</h3>
              <p className="text-xs text-akaroa/50 font-body">Your funds are protected. Milestone payments only trigger upon AI verification.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative z-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-akaroa/40 tracking-widest mb-1">Vault Balance</p>
                <p className="text-3xl font-bold font-heading text-akaroa">₱{totalEscrow.toLocaleString()}</p>
              </div>
              <Link href="/wallet">
                <Button fullWidth variant="ghost" className="h-12 rounded-xl bg-white/10 hover:bg-white/20 border-transparent text-white text-xs font-bold gap-2">
                  <Wallet className="w-4 h-4" /> Manage Vault
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Quick Look */}
          <div className="bg-white p-10 rounded-[3rem] border border-akaroa/10 shadow-sm space-y-8">
            <h3 className="font-heading font-bold text-rhino text-2xl">Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-rhino/5 border border-akaroa/5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-rhino/30 font-bold uppercase tracking-widest">Focus</p>
                  <p className="text-sm font-bold text-rhino">{user?.goal || "Not Set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-rhino/5 border border-akaroa/5">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-rhino/30 font-bold uppercase tracking-widest">Base</p>
                  <p className="text-sm font-bold text-rhino">{user?.province || "Not Set"}</p>
                </div>
              </div>
            </div>
            <Link href="/onboarding/ofw/step-1" className="block pt-2">
              <Button variant="ghost" fullWidth className="h-16 rounded-2xl bg-rhino/5 border-akaroa/10 hover:bg-rhino hover:text-white transition-all font-bold group">
                Account Settings <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Best Matches */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="text-left space-y-1">
            <h2 className="font-heading text-4xl font-bold text-rhino">Top Experts for You</h2>
            <p className="text-sm text-rhino/40 font-body">Hand-picked professionals matching your specific goals.</p>
          </div>
          <Link href="/consultants" className="text-sm font-bold text-desert hover:underline flex items-center gap-2 group">
            Browse All Experts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {localMatches.slice(0, 3).map((consultant, i) => (
            <MatchCard key={`local-${i}`} consultant={consultant} isLocal />
          ))}
          
          {(localMatches.length < 3) && otherMatches.slice(0, 6 - localMatches.length).map((consultant, i) => (
            <MatchCard key={`other-${i}`} consultant={consultant} />
          ))}
          
          {consultants.length === 0 && (
            // Premium Fallback if no specific consultants found (happy path)
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-[3rem] border border-akaroa/10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                <div className="w-20 h-20 rounded-[2rem] bg-rhino/5" />
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-rhino/5 rounded w-2/3 mx-auto" />
                  <div className="h-3 bg-rhino/5 rounded w-1/2 mx-auto" />
                </div>
                <div className="w-full h-12 bg-rhino/5 rounded-2xl" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ consultant, isLocal = false }: { consultant: any, isLocal?: boolean }) {
  const name = consultant.fullName || consultant.displayName || "Expert Partner";
  const expertise = consultant.expertise || consultant.categories || [];

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-akaroa/10 flex flex-col text-left group hover:border-desert/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-rhino/5">
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 rounded-2xl bg-rhino/5 flex items-center justify-center text-rhino font-bold text-xl overflow-hidden">
          {(consultant.photoUrl || consultant.photoURL) ? (
            <img src={consultant.photoUrl || consultant.photoURL} alt={name} className="w-full h-full object-cover" />
          ) : (
            (name || "?").split(' ').map((n: string) => n[0]).join('')
          )}
        </div>
        {isLocal && (
          <div className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[8px] font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" /> Best Match
          </div>
        )}
      </div>
      
      <div className="space-y-1 mb-6">
        <h4 className="font-heading font-bold text-rhino text-lg">{name}</h4>
        <p className="font-body text-xs text-rhino/40">{consultant.professionalTitle}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {expertise.slice(0, 2).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-rhino/5 text-rhino/60 text-[9px] font-bold uppercase tracking-tight">{tag}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-akaroa/10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[9px] text-rhino/30 font-bold uppercase tracking-widest">Rate Range</p>
          <p className="text-sm font-bold text-rhino truncate">₱{consultant.projectRateRange?.min?.toLocaleString()} – ₱{consultant.projectRateRange?.max?.toLocaleString()}</p>
        </div>
        <Link href={`/consultants/${consultant.uid}`}>
          <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 border-akaroa/20 hover:bg-desert hover:text-white shrink-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ConsultantDashboard({ user, engagements }: { user: any, engagements: any[] }) {
  const firstName = user?.displayName?.split(' ')[0] || "Consultant";
  
  const activeProjects = engagements.filter(e => e.status !== 'REQUESTED' && e.status !== 'completed');
  const newLeads = engagements.filter(e => e.status === 'REQUESTED');
  const totalEarnings = 54200; // Mock

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-4xl font-bold text-rhino">Magandang umaga, {firstName}.</h1>
            <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-200">
              Verified Expert
            </div>
          </div>
          <p className="font-body text-rhino/60">
            You have {activeProjects.length} active clients and {newLeads.length} new leads waiting.
          </p>
        </div>
        
        <div className="flex gap-3">
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
            <h3 className="font-heading font-bold text-rhino text-2xl">{activeProjects.length}</h3>
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
            <p className="text-[10px] text-akaroa/40 font-bold uppercase tracking-widest">Trust Score</p>
            <h3 className="font-heading font-bold text-white text-2xl uppercase tracking-wider">A+</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* New Leads Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-rhino text-left">New Leads</h2>
              {newLeads.length > 0 && <span className="bg-desert text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-pulse">{newLeads.length} PENDING</span>}
            </div>
            
            <div className="space-y-4">
              {newLeads.map((lead, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border-2 border-desert/20 flex flex-col md:flex-row items-center justify-between group hover:border-desert transition-all shadow-lg shadow-desert/5 text-left gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-rhino text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-rhino/20">
                      {(lead.metadata?.ofwName || lead.ofwId || "?")[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-rhino text-lg">{lead.metadata?.ofwName || "New Worker"}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-wider">Requested</span>
                      </div>
                      <p className="font-body text-xs text-rhino/50">Goal: <span className="text-desert font-bold">{lead.metadata?.ofwGoal}</span> • Location: {lead.metadata?.ofwProvince}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-rhino/30 font-bold mt-2">
                        <Wallet className="w-3 h-3" /> Cap: {lead.metadata?.ofwSalaryRange?.replace('_', ' - ')}
                      </div>
                    </div>
                  </div>
                  <Link href={`/engagements/${lead.id}`}>
                    <Button variant="primary" size="md" className="rounded-xl h-12 px-8 shadow-xl shadow-desert/20">
                      View Profile & Proposal
                    </Button>
                  </Link>
                </div>
              ))}
              {newLeads.length === 0 && (
                <div className="p-12 text-center bg-rhino/5 rounded-[2.5rem] border border-dashed border-akaroa/20">
                  <p className="font-body text-rhino/40 text-sm">No new consultation requests at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Management */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-rhino text-left">Active Roadmap Management</h2>
            <div className="space-y-4">
              {activeProjects.map((engagement, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-akaroa/10 flex items-center justify-between group hover:border-rhino/30 transition-all shadow-sm text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rhino/5 text-rhino flex items-center justify-center font-bold">
                      {(engagement.title || "?")[0]}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-rhino">{engagement.title || "Untitled Engagement"}</h4>
                      <p className="font-body text-[10px] text-desert font-bold uppercase tracking-wider">{engagement.ofwName || "New Client"}</p>
                      <p className="font-body text-[9px] text-rhino/40 capitalize">{engagement.category} • {engagement.mode || "Standard"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[8px] font-bold uppercase px-3 py-1 rounded-full border",
                      engagement.status === 'EXECUTION' ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"
                    )}>
                      {engagement.status.replace('_', ' ')}
                    </span>
                    <Link href={`/engagements/${engagement.id}`}>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-rhino hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-akaroa/20">
                  <p className="font-body text-rhino/40 text-sm">No active projects yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-rhino text-left">Recent Activity</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-akaroa/10 space-y-4 text-left">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-desert/10 flex items-center justify-center text-desert shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rhino font-heading">AI Identity Verified</p>
                  <p className="text-[10px] text-rhino/50 font-body">Your professional credentials have been successfully audited.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
