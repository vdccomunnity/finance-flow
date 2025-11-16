import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`
      }
    }
  )

// Tipos e exports para compatibilidade
export type DatabaseUser = {
  id: string;
  email: string;
  nome: string;
  plano: 'nenhum' | 'mensal' | 'trimestral' | null;
  status: 'ativo' | 'expirado' | 'inativo' | 'nao_assinou';
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
  updated_at: string;
}

// Cliente Supabase para uso no browser
export const supabase = createClient()

// Função de validação
export function requireSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }
}
