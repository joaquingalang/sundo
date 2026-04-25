"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Camera, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function OFWStep2Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    professionalTitle: "",
    country: "",
    employer: "",
    situation: "",
    salaryRange: "",
    remittanceRange: "",
    photoURL: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        professionalTitle: user.professionalTitle || prev.professionalTitle,
        country: user.country || prev.country,
        employer: user.employer || prev.employer,
        situation: user.situation || prev.situation,
        salaryRange: user.salaryRange || prev.salaryRange,
        remittanceRange: user.remittanceRange || prev.remittanceRange,
        photoURL: user.photoURL || prev.photoURL
      }));
    }
  }, [user]);

  async function handleContinue() {
    if (!user) return;
    setIsLoading(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        onboardingStep: "ofw-step-3"
      });
      router.push("/onboarding/ofw/step-3");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to Firebase Storage
      // For now, we'll simulate with a local preview or placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-rhino/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-rhino" />
        </button>
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold text-rhino">Personalize your profile</h1>
          <p className="font-body text-rhino/60 text-sm">Let the community know who you are.</p>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-rhino/5 border-2 border-dashed border-akaroa/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-desert/50">
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-rhino/20" />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-desert text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
        <p className="text-xs font-bold text-rhino/40 uppercase tracking-widest">Upload Profile Photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input 
            label="Last Position Abroad" 
            placeholder="e.g., Construction Engineer" 
            value={formData.professionalTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, professionalTitle: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground font-body">Country of Deployment</label>
          <select 
            className="h-11 px-4 rounded-lg border border-akaroa font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rhino"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          >
            <option value="">Select Country</option>
            <option>Saudi Arabia</option>
            <option>UAE</option>
            <option>Kuwait</option>
            <option>Qatar</option>
            <option>Hong Kong</option>
            <option>Taiwan</option>
          </select>
        </div>
        <Input 
          label="Employer Abroad" 
          placeholder="Company Name" 
          value={formData.employer}
          onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
        />
        
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground font-body">Current Situation</label>
          <select 
            className="h-11 px-4 rounded-lg border border-akaroa font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rhino"
            value={formData.situation}
            onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
          >
            <option value="">Select Situation</option>
            <option>Currently abroad, planning to return</option>
            <option>Recently repatriated (within 30 days)</option>
            <option>Have been home 1–6 months</option>
            <option>Have been home 6+ months</option>
          </select>
        </div>

        <Input 
          label="Salary Range (Monthly PHP)" 
          placeholder="e.g. 50,000 - 80,000" 
          value={formData.salaryRange}
          onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
        />
        <Input 
          label="Remittance Range (Monthly PHP)" 
          placeholder="e.g. 30,000" 
          value={formData.remittanceRange}
          onChange={(e) => setFormData(prev => ({ ...prev, remittanceRange: e.target.value }))}
        />
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => router.back()}>Back</Button>
        <Button 
          className="flex-[2] rounded-2xl h-14" 
          isLoading={isLoading} 
          onClick={handleContinue}
          disabled={!formData.professionalTitle || !formData.country}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
