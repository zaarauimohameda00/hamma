declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
    PORT?: string
  }
}

