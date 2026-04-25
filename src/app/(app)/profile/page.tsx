"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Globe, 
  Briefcase,
  Camera,
  FileText,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/useAuthStore";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    city: "",
    province: "",
    professionalTitle: "",
    country: "",
    totalYearsAbroad: "",
    photoURL: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        city: user.city || "",
        province: user.province || "",
        professionalTitle: user.professionalTitle || "",
        country: user.country || "",
        totalYearsAbroad: user.totalYearsAbroad || "",
        photoURL: user.photoURL || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/login");
  };

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

  if (!user) return null;

  const initials = formData.displayName.split(' ').map(n => n[0]).join('') || "U";

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-2 text-left">
        <h1 className="font-heading text-4xl font-bold text-rhino">My Profile</h1>
        <p className="font-body text-rhino/60">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-akaroa/10 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-rhino text-white flex items-center justify-center text-4xl font-bold shadow-2xl shadow-rhino/20 overflow-hidden">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-desert text-white flex items-center justify-center shadow-lg hover:bg-walnut transition-colors border-4 border-white cursor-pointer">
                <Camera className="w-5 h-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            
            <div className="space-y-1 text-center">
              <h3 className="font-heading font-bold text-2xl text-rhino">{formData.displayName}</h3>
              <p className="font-body text-xs text-rhino/40 uppercase tracking-widest font-bold">Verified {user.role?.toUpperCase()}</p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-100">
              <ShieldCheck className="w-3 h-3" />
              Account Active
            </div>
          </div>

          <div className="bg-rhino rounded-[2rem] p-8 text-white space-y-6 text-left">
            <h4 className="font-heading font-bold text-lg">Account Security</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-akaroa/40" />
                  <span className="text-sm font-body text-akaroa/60">Change Email</span>
                </div>
                <ChevronRight className="w-4 h-4 text-akaroa/20 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-akaroa/40" />
                  <span className="text-sm font-body text-akaroa/60">Two-Factor Auth</span>
                </div>
                <ChevronRight className="w-4 h-4 text-akaroa/20 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-white/5 text-red-300 hover:bg-red-500/10 transition-all font-body text-xs font-bold mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from all devices
            </button>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-akaroa/10 shadow-sm space-y-8 text-left">
            <h2 className="font-heading text-2xl font-bold text-rhino">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input 
                  label="Full Name" 
                  value={formData.displayName} 
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
              <Input label="Email Address" value={user.email || ""} readOnly />
              <Input 
                label="Phone Number" 
                placeholder="+63 917 123 4567" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
              
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="City" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                  <Input 
                    label="Province" 
                    value={formData.province} 
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                className="px-10 rounded-xl h-12 shadow-xl shadow-rhino/5"
                isLoading={isSaving}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-akaroa/10 shadow-sm space-y-8 text-left">
            <h2 className="font-heading text-2xl font-bold text-rhino">Professional Background</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input 
                  label="Last Position Abroad" 
                  value={formData.professionalTitle} 
                  onChange={(e) => setFormData({...formData, professionalTitle: e.target.value})}
                />
              </div>
              <Input 
                label="Country of Deployment" 
                value={formData.country} 
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
              <Input 
                label="Total Years Abroad" 
                value={formData.totalYearsAbroad} 
                onChange={(e) => setFormData({...formData, totalYearsAbroad: e.target.value})}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                className="px-10 rounded-xl h-12 shadow-xl shadow-rhino/5"
                isLoading={isSaving}
                onClick={handleSave}
              >
                Update Background
              </Button>
            </div>
          </div>

          <div className="bg-rhino/5 rounded-[2.5rem] p-10 border border-akaroa/10 space-y-8 text-left">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-rhino">Verified Documents</h2>
              <Button variant="ghost" className="h-10 rounded-xl text-xs font-bold font-body bg-white border-akaroa/10">Manage Documents</Button>
            </div>

            <div className="space-y-4">
              {[
                { name: "Government_ID.pdf", date: "Apr 25, 2026", status: "Verified" },
                { name: "Passport_Data_Page.jpg", date: "Apr 25, 2026", status: "Verified" },
                { name: "OFW_OEC_Proof.pdf", date: "Apr 25, 2026", status: "Verified" }
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-akaroa/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rhino/5 flex items-center justify-center text-rhino">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rhino">{doc.name}</p>
                      <p className="text-[10px] text-rhino/40 font-body uppercase tracking-widest">Uploaded on {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    {doc.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
