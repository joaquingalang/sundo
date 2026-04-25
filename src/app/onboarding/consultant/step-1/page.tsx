"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Award, Globe, DollarSign, Camera } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/useAuthStore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ConsultantStep1Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    expertise: "",
    bio: "",
    areaOfOperation: "",
    priceRange: "medium", // low, medium, high
    photoURL: user?.photoURL || ""
  });

  async function handleSubmit() {
    if (!formData.expertise || !formData.bio || !user) return;
    setIsLoading(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        professionalTitle: formData.expertise, // Map expertise to professionalTitle for compatibility
        onboardingStep: "consultant-2"
      });
      router.push("/onboarding/consultant/step-2");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const priceRanges = [
    { id: "low", label: "Affordable", desc: "₱500 - ₱1,500" },
    { id: "medium", label: "Standard", desc: "₱1,500 - ₱5,000" },
    { id: "high", label: "Premium", desc: "₱5,000+" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-rhino/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-rhino" />
        </button>
        <div className="space-y-1 text-left">
          <h1 className="font-heading text-3xl font-bold text-rhino">Expertise & Service</h1>
          <p className="font-body text-rhino/60 text-sm">Tell us how you help OFWs reintegrate.</p>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-rhino/5 border-2 border-dashed border-akaroa/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-desert/50">
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rhino/5 text-rhino/20">
                <Globe className="w-12 h-12" />
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-desert text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Camera className="absolute inset-0 m-auto w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
        <p className="text-xs font-bold text-rhino/40 uppercase tracking-widest">Profile Photo</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest ml-4">Primary Expertise</label>
          <div className="relative group">
            <Award className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-rhino/20 group-focus-within:text-desert transition-colors" />
            <input 
              type="text" 
              placeholder="e.g. Retail Business, Agriculture, Legal Aid"
              value={formData.expertise}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-akaroa/10 font-body text-sm outline-none focus:ring-4 focus:ring-rhino/5 focus:border-akaroa/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest ml-4">Area of Operation</label>
          <div className="relative group">
            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-rhino/20 group-focus-within:text-desert transition-colors" />
            <input 
              type="text" 
              placeholder="e.g. Metro Manila, Davao, Nationwide"
              value={formData.areaOfOperation}
              onChange={(e) => setFormData({...formData, areaOfOperation: e.target.value})}
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-akaroa/10 font-body text-sm outline-none focus:ring-4 focus:ring-rhino/5 focus:border-akaroa/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest ml-4">Bio / Success Summary</label>
          <textarea 
            placeholder="Briefly describe your background and how you've helped others..."
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            className="w-full min-h-[120px] p-6 rounded-2xl bg-white border border-akaroa/10 font-body text-sm outline-none focus:ring-4 focus:ring-rhino/5 focus:border-akaroa/30 transition-all resize-none"
          />
        </div>

        <div className="space-y-4 text-left">
          <label className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest ml-4">Consultation Pricing</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setFormData({...formData, priceRange: range.id})}
                className={cn(
                  "p-6 rounded-2xl border transition-all text-left space-y-1",
                  formData.priceRange === range.id 
                    ? "bg-rhino border-rhino text-white shadow-xl shadow-rhino/10" 
                    : "bg-white border-akaroa/10 text-rhino hover:border-akaroa/30"
                )}
              >
                <DollarSign className={cn("w-5 h-5 mb-2", formData.priceRange === range.id ? "text-desert" : "text-rhino/20")} />
                <p className="text-sm font-bold">{range.label}</p>
                <p className={cn("text-[10px] font-body", formData.priceRange === range.id ? "text-akaroa/60" : "text-rhino/40")}>{range.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => router.back()}>Back</Button>
        <Button 
          className="flex-[2] rounded-2xl h-14" 
          isLoading={isLoading} 
          onClick={handleSubmit}
          disabled={!formData.expertise || !formData.bio}
        >
          Next: Identity Verification
        </Button>
      </div>
    </div>
  );
}
