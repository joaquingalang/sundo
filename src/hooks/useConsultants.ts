import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";

export function useConsultants(goal?: string, province?: string, searchQuery?: string) {
  const [consultants, setConsultants] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConsultants() {
      setIsLoading(true);
      try {
        let q = query(
          collection(db, "users"), 
          where("role", "==", "consultant"),
          where("status", "==", "verified")
        );

        const querySnapshot = await getDocs(q);
        let fetched = querySnapshot.docs.map(doc => ({ 
          ...doc.data(), 
          uid: doc.id 
        }) as UserProfile);

        // Category Filtering (Mandatory if provided)
        if (goal && goal !== "all") {
          fetched = fetched.filter(c => 
            c.expertise?.some(e => e.toLowerCase() === goal.toLowerCase())
          );
        }

        // Client-side search filtering
        if (searchQuery) {
          const s = searchQuery.toLowerCase();
          fetched = fetched.filter(c => 
            c.displayName?.toLowerCase().includes(s) ||
            c.professionalTitle?.toLowerCase().includes(s) ||
            c.bio?.toLowerCase().includes(s) ||
            c.expertise?.some(e => e.toLowerCase().includes(s))
          );
        }

        // Sorting/Matchmaking Logic
        if (goal || province) {
          fetched = fetched.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (province && province !== "all") {
              if (a.areaOfOperation === province) scoreA += 10;
              if (b.areaOfOperation === province) scoreB += 10;
            }

            if (goal && goal !== "all") {
              if (a.expertise?.includes(goal)) scoreA += 5;
              if (b.expertise?.includes(goal)) scoreB += 5;
            }

            return scoreB - scoreA;
          });
        }

        setConsultants(fetched);
      } catch (error) {
        console.error("Error fetching consultants:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConsultants();
  }, [goal, province, searchQuery]);

  return { consultants, isLoading };
}
