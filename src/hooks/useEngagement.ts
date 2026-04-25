import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Engagement, Milestone, ChatMessage } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

export function useEngagement(engagementId: string) {
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!engagementId) return;

    const unsubscribeEngagement = onSnapshot(doc(db, "engagements", engagementId), (doc) => {
      if (doc.exists()) {
        setEngagement({ id: doc.id, ...doc.data() } as Engagement);
      }
      setIsLoading(false);
    });

    const unsubscribeMilestones = onSnapshot(
      query(collection(db, "engagements", engagementId, "milestones"), orderBy("createdAt", "asc")),
      (snapshot) => {
        setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
      }
    );

    return () => {
      unsubscribeEngagement();
      unsubscribeMilestones();
    };
  }, [engagementId]);

  return { engagement, milestones, isLoading };
}

export function useEngagementChat(engagementId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!engagementId) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "engagements", engagementId, "messages"), orderBy("createdAt", "asc")),
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      }
    );

    return unsubscribe;
  }, [engagementId]);

  return { messages };
}

export function useEngagements() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      setEngagements([]);
      setIsLoading(false);
      return;
    }

    const roleField = user.role === "consultant" ? "consultantId" : "ofwId";
    
    const unsubscribe = onSnapshot(
      query(
        collection(db, "engagements"), 
        where(roleField, "==", user.uid),
        orderBy("updatedAt", "desc")
      ),
      (snapshot) => {
        setEngagements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Engagement)));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching engagements:", error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { engagements, isLoading };
}
