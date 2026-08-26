/// <reference types="vite/client" />

// Deklariert die projekteigenen Umgebungsvariablen, damit sie typisiert statt
// als `any` verfügbar sind. Beide Werte sind öffentlich (S1.1) und werden über
// Deployment-Umgebungsvariablen bereitgestellt (A07).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
