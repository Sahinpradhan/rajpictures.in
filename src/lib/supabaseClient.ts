import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseGalleryBucket =
  (import.meta.env.VITE_SUPABASE_GALLERY_BUCKET as string | undefined) || "portfolio";

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    console.error(
      `[Raj Pictures] Missing env var ${key}. Add it to .env (see .env.example). The app will continue, but data-driven features may be disabled.`
    );
    return ""; // Return empty string to prevent throw, though Supabase will still fail when used.
  }
  return value;
}

let supabaseInstance: SupabaseClient;

try {
  const url = supabaseUrl || "";
  const key = supabaseAnonKey || "";

  // If no URL is provided, createClient(url, key) might throw immediately in some versions 
  // or return a client that fails. We'll attempt creation and fallback if it fails.
  if (!url || !key) {
    console.warn("[Raj Pictures] Supabase configuration is missing. Data features will be disabled.");
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (error) {
  console.error("[Raj Pictures] Failed to initialize Supabase client:", error);
  // We recreate a "minimal" dummy client or just cast an empty object if we must 
  // though typically createClient with empty strings doesn't throw until used.
  supabaseInstance = {} as SupabaseClient; 
}

export const supabase = supabaseInstance;

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(window.localStorage);
    for (const key of keys) {
      // Supabase JS stores sessions under keys like: sb-<project-ref>-auth-token
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage access errors.
  }
}

export type GalleryCategory = "Weddings" | "Cinematic";

export type GalleryItem = {
  id: number | string;
  title: string | null;
  category: GalleryCategory | null;
  image_url: string;
  storage_path: string | null;
  created_at: string;
};
