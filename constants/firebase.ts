export const firebase_api_key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
export const firebase_auth_domain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
export const firebase_database_url =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "";
export const firebase_project_id =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
export const firebase_storage_bucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
export const firebase_messaging_sender_id =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
export const firebase_app_id = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";

export const firebase_config = {
  apiKey: firebase_api_key,
  authDomain: firebase_auth_domain,
  databaseURL: firebase_database_url,
  projectId: firebase_project_id,
  storageBucket: firebase_storage_bucket,
  messagingSenderId: firebase_messaging_sender_id,
  appId: firebase_app_id,
};
