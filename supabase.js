// Supabase project credentials
// Project URL and anon key: Supabase Dashboard → Settings → API
const SUPABASE_URL  = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON = "YOUR_SUPABASE_ANON_KEY";

// Returns null when credentials are not configured (app runs on local mock data)
const supabase = (() => {
  if (typeof window.supabase === "undefined") return null;
  if (SUPABASE_URL.startsWith("YOUR_")) return null;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
})();
