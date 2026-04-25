import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";

export async function seedDatabase() {
  console.log("Seeding database...");

  // 1. Create Consultants
  const consultants = [
    {
      uid: "cons_1",
      displayName: "Carlo Santos",
      email: "carlo@example.com",
      role: "consultant",
      isOnboarded: true,
      status: "verified",
      professionalTitle: "Business & Reintegration Expert",
      yearsExperience: 12,
      bio: "Experienced entrepreneur helping OFWs set up sustainable local businesses.",
      categories: ["business", "reintegration"],
      sessionRate: 1500,
      projectRateRange: { min: 10000, max: 50000 },
    },
    {
      uid: "cons_2",
      displayName: "Maria Clara",
      email: "maria@example.com",
      role: "consultant",
      isOnboarded: true,
      status: "verified",
      professionalTitle: "Certified Benefits Consultant",
      yearsExperience: 8,
      bio: "Specializing in SSS, PhilHealth, and OWWA claims for repatriated workers.",
      categories: ["benefits", "general"],
      sessionRate: 800,
      projectRateRange: { min: 5000, max: 15000 },
    }
  ];

  for (const c of consultants) {
    await setDoc(doc(db, "users", c.uid), {
      ...c,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 2. Create a Sample Engagement for demo
  // This will be useful if the user logs in as a specific OFW
  
  console.log("Seeding complete!");
}
