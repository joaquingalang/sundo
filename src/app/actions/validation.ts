"use server";

import { validateDocument } from "@/lib/gemini";
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function processDocumentUpload(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const engagementId = formData.get("engagementId") as string;
    const milestoneId = formData.get("milestoneId") as string;
    const expectedType = (formData.get("expectedType") as string) || "Project Deliverable";
    
    if (!file) return { status: "failed", analysis: "No file uploaded" };

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    
    // 1. Validate with Gemini
    const validation = await validateDocument(base64, file.type, expectedType);

    // 2. If it's a milestone proof, update milestone
    if (engagementId && milestoneId && milestoneId !== "default") {
      const milestoneRef = doc(db, "engagements", engagementId, "milestones", milestoneId);
      await updateDoc(milestoneRef, {
        proofOfWorkURL: "mock_url",
        status: validation.isVerified ? "released" : "disputed",
        aiValidationResult: {
          ...validation,
          auditedAt: new Date(),
        }
      });

      // Add a system message to chat
      await addDoc(collection(db, "engagements", engagementId, "messages"), {
        engagementId,
        senderId: "system",
        content: validation.isVerified 
          ? `Deliverable validated by AI. Funds released.` 
          : `Validation failed: ${validation.reasoning}`,
        type: "system",
        createdAt: serverTimestamp(),
      });
    }

    return {
      status: validation.isVerified ? "passed" : "failed",
      confidence: validation.confidence,
      analysis: validation.reasoning
    };
  } catch (error: any) {
    console.error("Process Document Error:", error);
    return {
      status: "failed",
      analysis: `Process Error: ${error.message || "Unknown error"}`
    };
  }
}
