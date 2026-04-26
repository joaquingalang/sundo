"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { UserProfile } from "@/types";
import { Calendar, Clock, ShieldCheck, ArrowRight, Video } from "lucide-react";

export default function SessionBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [consultant, setConsultant] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchConsultant() {
      const docRef = doc(db, "users", params.consultantId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConsultant(docSnap.data() as UserProfile);
      }
      setIsLoading(false);
    }
    fetchConsultant();
  }, [params.consultantId]);

  async function handleBook() {
    if (!consultant || !auth.currentUser) return;
    setIsSubmitting(true);

    try {
      const engagementRef = await addDoc(collection(db, "engagements"), {
        ofwId: auth.currentUser.uid,
        consultantId: consultant.uid,
        title: `Session with ${consultant.displayName}`,
        description: `1-hour consultation session for ${consultant.expertise?.[0] || 'general'} guidance.`,
        category: consultant.expertise?.[0] || 'general',
        mode: "session",
        status: "pending_acceptance",
        totalAmount: consultant.sessionRate || 0,
        escrowStatus: "unfunded",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      });

      // Add initial system message
      await addDoc(collection(db, "engagements", engagementRef.id, "messages"), {
        engagementId: engagementRef.id,
        senderId: "system",
        content: "New session request created. Waiting for consultant to accept.",
        type: "system",
        createdAt: serverTimestamp(),
      });

      router.push(`/engagements/${engagementRef.id}`);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-desert border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold text-rhino">Book a Session</h1>
        <p className="font-body text-rhino/60">Finalize your consultation details with {consultant?.displayName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-akaroa/10 shadow-sm space-y-6">
            <h2 className="font-heading text-xl font-bold text-rhino">Consultation Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-rhino/5 border border-akaroa/5">
                <Video className="w-5 h-5 text-rhino/40" />
                <div>
                  <p className="text-xs font-bold text-rhino">Google Meet Session</p>
                  <p className="text-[10px] text-rhino/40 font-body">1-hour video consultation</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-rhino/5 border border-akaroa/5">
                <ShieldCheck className="w-5 h-5 text-rhino/40" />
                <div>
                  <p className="text-xs font-bold text-rhino">Sundo Escrow Protection</p>
                  <p className="text-[10px] text-rhino/40 font-body">Payment released after session</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rhino/5 p-8 rounded-[2.5rem] border border-akaroa/10 space-y-6">
            <h2 className="font-heading text-xl font-bold text-rhino">Session Rate</h2>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-rhino font-heading">₱{consultant?.sessionRate?.toLocaleString()}</span>
              <span className="text-rhino/40 font-body text-sm mb-1">/ hour</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-rhino shadow-2xl shadow-rhino/10 space-y-8 h-fit">
          <h2 className="font-heading text-2xl font-bold text-rhino">Order Summary</h2>
          <div className="space-y-4 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-rhino/60">Consultation Fee</span>
              <span className="font-bold text-rhino">₱{consultant?.sessionRate?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rhino/60">Platform Fee (5%)</span>
              <span className="font-bold text-rhino">₱{((consultant?.sessionRate || 0) * 0.05).toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-akaroa/10 flex justify-between text-lg font-bold">
              <span className="text-rhino">Total Amount</span>
              <span className="text-desert">₱{((consultant?.sessionRate || 0) * 1.05).toLocaleString()}</span>
            </div>
          </div>

          <Button 
            fullWidth 
            size="md" 
            isLoading={isSubmitting} 
            onClick={handleBook}
            className="h-16 text-lg rounded-2xl group"
          >
            Confirm & Book
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-[10px] text-center text-rhino/40 font-body leading-relaxed">
            By clicking "Confirm & Book", you agree to Sundo's Terms of Service and Escrow Policy. Funds will be held securely until the session is completed.
          </p>
        </div>
      </div>
    </div>
  );
}
