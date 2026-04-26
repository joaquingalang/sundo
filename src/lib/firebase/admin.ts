import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";

declare global {
  // eslint-disable-next-line no-var
  var _adminApp: App | undefined;
}

function getAdminApp(): App {
  if (globalThis._adminApp) return globalThis._adminApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("Missing environment variable: FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  // Dotenv on Windows stores \\n as a literal two-character sequence.
  // The PEM parser requires real newline characters.
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  const app =
    getApps().find((a) => a.name === "admin") ??
    initializeApp({ credential: cert(serviceAccount) }, "admin");

  if (process.env.NODE_ENV !== "production") {
    globalThis._adminApp = app;
  }

  return app;
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

/**
 * Extracts and verifies the Firebase ID token from an API request.
 * The client sends: Authorization: Bearer <idToken>
 * Returns the decoded token (with uid) or throws if invalid/missing.
 */
export async function verifyAuth(req: NextRequest): Promise<DecodedIdToken> {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    throw new Error("Unauthorized");
  }

  return adminAuth.verifyIdToken(idToken);
}
