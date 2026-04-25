import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";

export function useConsultants(category = "all") {
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

        if (category !== "all") {
          q = query(q, where("categories", "array-contains", category));
        }

        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        setConsultants(fetched);
      } catch (error) {
        console.error("Error fetching consultants:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConsultants();
  }, [category]);

  return { consultants, isLoading };
}
