"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/cn";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("pending");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let q = collection(db, "users");
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(fetched);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId: string, status: "verified" | "rejected") => {
    try {
      await updateDoc(doc(db, "users", userId), { status });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === "all") return true;
    return u.status === filter;
  });

  return (
    <div className="min-h-screen bg-cream/30 p-8 md:p-12 space-y-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rhino text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-heading text-4xl font-bold text-rhino">Sundo Admin Control</h1>
            </div>
            <p className="font-body text-rhino/60">Verification queue and system management.</p>
          </div>

          <div className="flex bg-white rounded-xl p-1 border border-akaroa/20 shadow-sm">
            <button 
              onClick={() => setFilter("pending")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filter === "pending" ? "bg-desert text-white shadow-md" : "text-rhino/40")}
            >
              Pending Approval
            </button>
            <button 
              onClick={() => setFilter("verified")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filter === "verified" ? "bg-rhino text-white shadow-md" : "text-rhino/40")}
            >
              Verified
            </button>
            <button 
              onClick={() => setFilter("all")}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filter === "all" ? "bg-rhino/10 text-rhino" : "text-rhino/40")}
            >
              All Users
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-akaroa/10 shadow-sm space-y-2">
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Pending Verification</p>
            <h3 className="text-4xl font-bold font-heading text-rhino">{users.filter(u => u.status === 'pending').length}</h3>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-akaroa/10 shadow-sm space-y-2">
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">Total Consultants</p>
            <h3 className="text-4xl font-bold font-heading text-rhino">{users.filter(u => u.role === 'consultant').length}</h3>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-akaroa/10 shadow-sm space-y-2">
            <p className="text-[10px] text-rhino/40 font-bold uppercase tracking-widest">System Health</p>
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All Systems Nominal</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-akaroa/10 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-akaroa/5 bg-rhino/5 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-rhino text-left">User Queue</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rhino/30" />
              <input type="text" placeholder="Search by name..." className="w-full h-10 pl-10 pr-4 rounded-xl border border-akaroa/10 text-xs" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-rhino/5 text-[10px] text-rhino/40 font-bold uppercase tracking-widest">
                  <th className="p-6">User</th>
                  <th className="p-6">Role</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Registered</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-akaroa/5">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-rhino/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rhino text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.displayName?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-rhino">{u.displayName}</p>
                          <p className="text-[10px] text-rhino/40 font-body">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        u.role === 'consultant' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {u.status === 'verified' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                         u.status === 'pending' ? <Clock className="w-4 h-4 text-desert" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-xs font-body capitalize">{u.status}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-rhino/40 font-body">
                      Apr 26, 2026
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          onClick={() => handleVerify(u.uid, "verified")}
                          size="sm" 
                          variant="ghost" 
                          className="h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border-none px-4"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleVerify(u.uid, "rejected")}
                          size="sm" 
                          variant="ghost" 
                          className="h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border-none px-4"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <Users className="w-12 h-12 text-rhino/10 mx-auto" />
                <p className="font-heading font-bold text-rhino/40">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
