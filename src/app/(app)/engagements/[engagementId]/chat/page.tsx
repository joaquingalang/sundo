"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  FileText,
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Video,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEngagementChat, useEngagement } from "@/hooks/useEngagement";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function EngagementChatPage() {
  const params = useParams();
  const pathname = usePathname();
  const engagementId = params.engagementId as string;
  const { messages } = useEngagementChat(engagementId);
  const { engagement } = useEngagement(engagementId);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const tabs = [
    { label: "Overview", href: `/engagements/${engagementId}`, icon: Layers },
    { label: "Chat", href: `/engagements/${engagementId}/chat`, icon: MessageSquare },
    { label: auth.currentUser?.uid === engagement?.consultantId ? "Project Manager" : "Task Tracker", href: `/engagements/${engagementId}/milestones`, icon: ShieldCheck },
    { label: "Vault", href: `/engagements/${engagementId}/vault`, icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!message.trim() || !auth.currentUser) return;

    const content = message;
    setMessage("");

    await addDoc(collection(db, "engagements", engagementId, "messages"), {
      engagementId,
      senderId: auth.currentUser.uid,
      content,
      type: "text",
      createdAt: serverTimestamp(),
    });
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/engagements" className="p-3 rounded-2xl bg-white border border-akaroa/10 text-rhino hover:bg-rhino hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-rhino">{engagement?.title || "Chat"}</h1>
              <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[8px] font-bold uppercase tracking-wider border border-green-100">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-rhino/5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <Link 
              key={tab.label} 
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-body transition-all",
                isActive(tab.href) 
                  ? "bg-white text-rhino shadow-md" 
                  : "text-rhino/40 hover:text-rhino/60"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive(tab.href) ? "text-desert" : "text-rhino/20")} />
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-akaroa/10 shadow-sm flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-cream/20">
          {messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            const isSystem = msg.senderId === "system";

            return (
              <div key={msg.id} className={cn(
                "flex flex-col",
                isMe ? "items-end" : isSystem ? "items-center" : "items-start"
              )}>
                {msg.type === "system" && (
                  <div className="bg-rhino/5 px-4 py-2 rounded-full border border-akaroa/10">
                    <p className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest">{msg.content}</p>
                  </div>
                )}

                {msg.type === "text" && (
                  <div className="max-w-[70%] space-y-1">
                    <div className={cn(
                      "p-4 rounded-3xl text-sm font-body shadow-sm",
                      isMe 
                        ? "bg-rhino text-white rounded-br-none" 
                        : "bg-white text-rhino rounded-bl-none border border-akaroa/10"
                    )}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-rhino/30 font-body px-2">
                      {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {msg.type === "milestone_update" && (
                  <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-akaroa/20 shadow-lg my-4 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-heading font-bold text-rhino text-sm">Milestone Update</h4>
                      </div>
                    </div>
                    <p className="text-xs text-rhino/50 font-body">{msg.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-akaroa/10">
          <div className="flex items-center gap-4 bg-rhino/5 p-2 pr-4 rounded-2xl focus-within:ring-4 focus-within:ring-rhino/5 transition-all">
            <button type="button" className="p-3 rounded-xl hover:bg-white text-rhino/40 hover:text-rhino transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none font-body text-sm text-rhino py-3"
            />
            <button type="button" className="p-3 rounded-xl hover:bg-white text-rhino/40 hover:text-rhino transition-all">
              <Smile className="w-5 h-5" />
            </button>
            <Button 
              type="submit"
              size="sm" 
              className={cn(
                "h-10 w-10 p-0 rounded-xl transition-all",
                message ? "bg-rhino scale-100" : "bg-rhino/20 scale-90"
              )}
              disabled={!message}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
