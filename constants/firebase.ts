import { ServiceAccount } from "firebase-admin";

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

export const firebase_service_type = process.env.FIREBASE_ACCOUNT_KEY || "";
export const firebase_service_email = process.env.FIREBASE_CLIENT_EMAIL || "";
export const firebase_service_id = process.env.FIREBASE_CLIENT_ID || "";
export const firebase_service_uri = process.env.FIREBASE_AUTH_URI || "";
export const firebase_service_token_uri = process.env.FIREBASE_TOKEN_URI || "";
export const firebase_service_cert_url = process.env.FIREBASE_CERT_URL || "";
export const firebase_service_client_cert_url =
  process.env.FIREBASE_CLIENT_CERT_URL || "";
export const firebase_service_universe_domain =
  process.env.FIREBASE_UNIVERSE_DOMAIN || "";

export const firebase_service_private_key_id =
  process.env.FIREBASE_PRIVATE_KEY_ID || "";
export const firebase_service_private_key =
  process.env.FIREBASE_PRIVATE_KEY || "";

export const serviceAccount = {
  type: firebase_service_type,
  project_id: firebase_project_id,
  private_key_id: firebase_service_private_key_id,
  private_key: firebase_service_private_key,
  client_email: firebase_service_email,
  client_id: firebase_service_id,
  auth_uri: firebase_service_uri,
  token_uri: firebase_service_token_uri,
  auth_provider_x509_cert_url: firebase_service_cert_url,
  client_x509_cert_url: firebase_service_client_cert_url,
  universe_domain: firebase_service_universe_domain,
};
