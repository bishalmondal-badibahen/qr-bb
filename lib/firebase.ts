// lib/firebase.js
import { firebase_config } from "@/constants/firebase";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const app = initializeApp(firebase_config);
export const db = getDatabase(app);
export const storage = getStorage(app);
