"use client";

import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  Lock, 
  History,
  ExternalLink,
  Plus
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useEngagements } from "@/hooks/useEngagement";
import { useAuthStore } from "@/store/useAuthStore";

export default function WalletPage() {
  const { user } = useAuthStore();
  const { engagements } = useEngagements();

  const totalEscrow = engagements.reduce((acc, e) => e.escrowStatus === 'funded' ? acc + (e.totalAmount || 0) : acc, 0);
  const totalInvested = engagements.filter(e => e.status === 'completed').reduce((acc, e) => acc + (e.totalAmount || 0), 0);

  const transactions = engagements.flatMap(e => {
    const txs = [];
    if (e.escrowStatus === 'funded') {
      txs.push({
        id: `escrow-${e.id}`,
        type: "escrow",
        title: `Escrow Funding - ${e.title}`,
        amount: `₱${e.totalAmount?.toLocaleString()}`,
        date: e.updatedAt?.toDate().toLocaleDateString() || "Recently",
        status: "locked"
      });
    }
    if (e.status === 'completed') {
      txs.push({
        id: `release-${e.id}`,
        type: "out",
        title: `Project Completion - ${e.title}`,
        amount: `₱${e.totalAmount?.toLocaleString()}`,
        date: e.updatedAt?.toDate().toLocaleDateString() || "Recently",
        status: "completed"
      });
    }
    return txs;
  });

  return (
    <div className="space-y-10">
      <div className="space-y-2 text-left">
        <h1 className="font-heading text-4xl font-bold text-rhino">My Wallet</h1>
        <p className="font-body text-rhino/60">
          Manage your payments and track funds held in escrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Balance Cards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Escrow Balance */}
            <div className="bg-rhino rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-rhino/20">
              <div className="relative z-10 space-y-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center text-akaroa backdrop-blur-md">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl">Total in Escrow</h3>
                    <p className="text-xs text-akaroa/60 font-body">Held Securely</p>
                  </div>
                </div>
                <h2 className="font-heading text-5xl font-bold">₱{totalEscrow.toLocaleString()}</h2>
                <div className="pt-4 flex items-center gap-2 text-akaroa/60 text-[10px] font-bold uppercase tracking-widest font-body">
                  <ShieldCheck className="w-4 h-4 text-desert" />
                  Protected by Sundo Vault
                </div>
              </div>
              <ShieldCheck className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform" />
            </div>

            {/* Spent Stats */}
            <div className="bg-white rounded-[3rem] p-10 border border-akaroa/10 shadow-sm space-y-8 text-left">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-desert/10 flex items-center justify-center text-desert">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-rhino">
                    {user?.role === "consultant" ? "Total Earned" : "Total Invested"}
                  </h3>
                  <p className="text-xs text-rhino/40 font-body">
                    {user?.role === "consultant" ? "Released Payments" : "Consultation Fees"}
                  </p>
                </div>
              </div>
              <h2 className="font-heading text-5xl font-bold text-rhino">₱{totalInvested.toLocaleString()}</h2>
              <div className="pt-4 flex items-center gap-2 text-rhino/40 text-[10px] font-bold uppercase tracking-widest font-body">
                <History className="w-4 h-4" />
                Across {engagements.length} engagements
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-[3rem] p-10 border border-akaroa/10 shadow-sm space-y-8 text-left">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-rhino">Transaction History</h2>
              <Button variant="ghost" className="h-10 rounded-xl text-xs font-bold font-body border-akaroa/10 px-6">Export Data</Button>
            </div>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 rounded-3xl bg-rhino/5 border border-akaroa/5 group hover:bg-rhino/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                      tx.type === "out" ? "bg-white text-green-600" : "bg-rhino text-white"
                    )}>
                      {tx.type === "out" ? <ArrowUpRight className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-heading font-bold text-rhino text-lg">{tx.title}</p>
                      <p className="text-[10px] text-rhino/40 font-body uppercase tracking-[0.2em] font-bold">{tx.date} • {tx.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-heading font-bold text-xl",
                      tx.type === "out" ? "text-rhino" : "text-desert"
                    )}>{tx.type === "out" ? "+" : ""}{tx.amount}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <History className="w-12 h-12 text-rhino/10 mx-auto" />
                  <p className="font-heading font-bold text-rhino/40">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods & Sidebar */}
        <div className="space-y-8 text-left">
          <div className="bg-white rounded-[3rem] p-8 border border-akaroa/10 shadow-sm space-y-8">
            <h3 className="font-heading font-bold text-xl text-rhino">Payment Methods</h3>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-rhino/10 bg-rhino/5 flex items-center justify-between group hover:border-desert/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center text-[10px] text-white font-bold">VISA</div>
                  <div>
                    <p className="text-sm font-bold text-rhino">•••• 4242</p>
                    <p className="text-[10px] text-rhino/40 font-body">Exp 12/28</p>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-rhino/30 uppercase tracking-widest bg-white px-2 py-1 rounded-full">Default</span>
              </div>
              
              <Button fullWidth variant="ghost" className="h-14 rounded-2xl border-dashed border-2 border-akaroa/30 text-rhino/40 hover:text-rhino hover:border-desert/50 gap-2 font-bold text-xs">
                <Plus className="w-4 h-4" />
                Add New Method
              </Button>
            </div>
          </div>

          <div className="bg-rhino/5 rounded-[3rem] p-8 border border-akaroa/10 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-desert" />
              <h3 className="font-heading font-bold text-xl text-rhino">Platform Economics</h3>
            </div>
            <div className="space-y-4 font-body text-xs text-rhino/60 leading-relaxed">
              <p>
                Sundo charges a flat <span className="font-bold text-rhino">5% platform fee</span> on all escrow transactions.
              </p>
              <p>
                This fee covers our document verification systems, escrow management, and AI-powered milestone validation.
              </p>
              <div className="pt-4 flex items-center justify-between border-t border-akaroa/10">
                <span className="font-bold">Next Payout Cycle</span>
                <span className="text-rhino font-bold">Immediate</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[3rem] bg-white border border-akaroa/10 shadow-sm space-y-6">
            <h3 className="font-heading font-bold text-xl text-rhino">Stripe Express</h3>
            <p className="font-body text-xs text-rhino/60 leading-relaxed">
              We use Stripe to handle secure payments and compliance. View your payment dashboard on Stripe for full details.
            </p>
            <Button fullWidth variant="ghost" className="h-14 rounded-2xl gap-2 border-akaroa/20 font-bold text-xs">
              Go to Stripe
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
