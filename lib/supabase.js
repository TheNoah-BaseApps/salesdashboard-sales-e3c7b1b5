import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database query helper with error handling
export async function dbQuery(queryFn) {
  try {
    const result = await queryFn();
    if (result.error) {
      console.error('Database query error:', result.error);
      throw new Error(result.error.message);
    }
    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}

// Get client for server-side operations
export function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}