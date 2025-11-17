// lib/serverFirebase.ts
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "@/keys/firebase_service.json";
import { firebase_database_url } from "@/constants/firebase";

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
