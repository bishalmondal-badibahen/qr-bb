// lib/serverFirebase.ts
import { firebase_database_url, serviceAccount } from "@/constants/firebase";
import admin, { ServiceAccount } from "firebase-admin";

let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: firebase_database_url,
  });
} else {
  app = admin.app();
}

export const adminDB = app.database();
