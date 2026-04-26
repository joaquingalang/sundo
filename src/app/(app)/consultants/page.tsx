"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  HelpCircle,
  ClipboardCheck,
  Home,
  GraduationCap,
  ShieldCheck,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useConsultants } from "@/hooks/useConsultants";

export default function ConsultantsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { consultants, isLoading } = useConsultants(
    activeCategory === "all" ? undefined : activeCategory,
    undefined,
    searchQuery
  );

  const categories = [
    { id: "all", label: "All Categories", icon: LayoutGrid },
    { id: "business", label: "Business", icon: TrendingUp },
    { id: "redeployment", label: "Redeployment", icon: Briefcase },
    { id: "general", label: "General", icon: HelpCircle },
    { id: "benefits", label: "Benefits", icon: ClipboardCheck },
    { id: "retirement", label: "Retirement", icon: Home },
    { id: "reintegration", label: "Reintegration", icon: ShieldCheck },
    { id: "education", label: "Education", icon: GraduationCap },
  ];

  return (
    <div className="space-y-10">
      {/* Header & Search */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-bold text-rhino">Find your Consultant</h1>
            <p className="font-body text-rhino/60">
              Discover verified experts ready to guide you through your reintegration.
            </p>
          </div>
          
          <div className="flex bg-white rounded-xl p-1 border border-akaroa/20 shadow-sm">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-rhino text-white shadow-md" : "text-rhino/40 hover:text-rhino")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-rhino text-white shadow-md" : "text-rhino/40 hover:text-rhino")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rhino/30" />
            <input 
              type="text" 
              placeholder="Search by name, expertise, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-akaroa/20 shadow-sm focus:border-desert focus:ring-4 focus:ring-desert/5 outline-none font-body transition-all"
            />
          </div>
          <Button variant="ghost" className="h-14 px-6 rounded-2xl border-2 flex gap-2">
            <Filter className="w-5 h-5" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-8 px-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm font-medium whitespace-nowrap transition-all border-2",
              activeCategory === cat.id
                ? "bg-rhino border-rhino text-white shadow-lg shadow-rhino/10"
                : "bg-white border-akaroa/10 text-rhino/60 hover:border-rhino/30 hover:text-rhino"
            )}
          >
            <cat.icon className={cn("w-4 h-4", activeCategory === cat.id ? "text-desert" : "text-rhino/30")} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Consultants Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" />
        </div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-white rounded-[3rem] border border-akaroa/10">
          <div className="w-20 h-20 bg-rhino/5 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-rhino/20" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-rhino">No consultants found</h3>
          <p className="font-body text-rhino/50 max-w-xs mx-auto">Try adjusting your filters or search terms to find more experts.</p>
          <Button variant="ghost" onClick={() => setActiveCategory("all")}>Clear Filters</Button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {consultants.map((c) => (
            <div 
              key={c.uid} 
              className={cn(
                "bg-white rounded-[2.5rem] border border-akaroa/10 shadow-sm hover:shadow-2xl hover:shadow-rhino/5 transition-all overflow-hidden group flex flex-col",
                viewMode === "list" && "md:flex-row md:items-center p-6 gap-8"
              )}
            >
              <div className={cn(
                "relative bg-cream/30 p-8 flex items-center justify-center",
                viewMode === "list" && "p-0 bg-transparent shrink-0"
              )}>
                <div className={cn(
                  "w-24 h-24 rounded-3xl bg-rhino text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-rhino/20 group-hover:scale-105 transition-transform overflow-hidden",
                  viewMode === "list" && "w-32 h-32"
                )}>
                  {c.photoURL ? (
                    <img src={c.photoURL} alt={c.displayName} className="w-full h-full object-cover" />
                  ) : (
                    (c.displayName || "?").split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white text-green-600 text-[8px] font-bold uppercase tracking-widest border border-green-100 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-2xl font-bold text-rhino">{c.displayName}</h3>
                    <div className="flex items-center gap-1 text-sm font-bold text-desert">
                      <Star className="w-4 h-4 fill-desert" />
                      4.9
                    </div>
                  </div>
                  <p className="font-body text-xs font-bold text-desert uppercase tracking-widest">{c.professionalTitle}</p>
                  <p className="font-body text-xs text-rhino/60 line-clamp-2 leading-relaxed">{c.bio}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {c.expertise?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-rhino/5 text-rhino/50 text-[10px] font-bold font-body uppercase">{tag}</span>
                  ))}
                </div>

                <div className="pt-6 border-t border-akaroa/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest font-bold text-left">Project Rate Range</p>
                    <p className="text-sm font-bold text-rhino">₱{c.projectRateRange?.min?.toLocaleString()} – ₱{c.projectRateRange?.max?.toLocaleString()}</p>
                  </div>
                  <Link href={`/consultants/${c.uid}`} className="flex-1">
                    <Button fullWidth className="h-12 rounded-xl group">
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
