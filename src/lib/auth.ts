// Sistema de autenticação com Supabase
import { supabase, type DatabaseUser, requireSupabase } from './supabase';

// Tipos
export interface User {
  id: string;
  email: string;
  nome: string;
  plano: 'nenhum' | 'mensal' | 'trimestral' | null;
  statusAssinatura: 'ativo' | 'expirado' | 'inativo' | 'nao_assinou';
  dataFimAssinatura: string | null;
  dataInicioAssinatura: string | null;
  isPremium: boolean;
  created_at: string;
  updated_at: string;
}

// Estado global do usuário atual (simples, sem context)
let currentUser: User | null = null;

// Funções de validação
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateName(name: string): boolean {
  return name.trim().length > 0;
}

// Função SÍNCRONA para obter usuário atual do cache em memória
export function getCurrentUser(): User | null {
  return currentUser;
}

// Função ASSÍNCRONA para carregar usuário da sessão do Supabase
export async function loadUserFromSession(): Promise<User | null> {
  // Se já tem usuário em memória, retornar
  if (currentUser) {
    return currentUser;
  }

  // Se não tem, tentar buscar da sessão do Supabase
  try {
    requireSupabase();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return null;
    }

    // Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    // Reconstruir o usuário e armazenar em memória
    const user: User = {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      plano: userData.plano,
      statusAssinatura: userData.status,
      dataFimAssinatura: userData.data_fim,
      dataInicioAssinatura: userData.data_inicio,
      isPremium: false,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    console.log('[AUTH] Usuário carregado da sessão:', {
      email: user.email,
      status: user.statusAssinatura,
      plano: user.plano,
      data_fim: user.dataFimAssinatura
    });

    currentUser = user;
    return user;
  } catch (error) {
    console.error('Erro ao recuperar usuário da sessão:', error);
    return null;
  }
}

// Função para definir usuário atual
export function setCurrentUser(user: User | null): void {
  currentUser = user;
}

// Verificar se tem assinatura ativa
export function hasActiveSubscription(user?: User | null): boolean {
  const targetUser = user || currentUser;
  if (!targetUser) return false;

  // Se o status é "ativo", permitir acesso independentemente da data
  // Isso resolve o problema quando o admin libera acesso manualmente
  if (targetUser.statusAssinatura === 'ativo') {
    return true;
  }

  // Bloquear outros status
  if (targetUser.statusAssinatura === 'nao_assinou') return false;
  if (targetUser.statusAssinatura === 'expirado') return false;
  if (targetUser.statusAssinatura === 'inativo') return false;

  return false;
}

// Função de login
export async function login(email: string, password: string): Promise<User> {
  requireSupabase();

  try {
    // Fazer login no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Tratamento específico de erros comuns
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
      }
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('Confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      }
      if (authError.message.includes('Too many requests')) {
        throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.');
      }
      if (authError.message.includes('User not found')) {
        throw new Error('Usuário não encontrado. Verifique se o email está correto.');
      }
      throw new Error(`Erro ao fazer login: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Falha na autenticação. Tente novamente.');
    }

    // Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Se o usuário não existe na tabela users (PGRST116), criar automaticamente
    if (userError && userError.code === 'PGRST116') {
      const now = new Date().toISOString();
      
      // PRIMEIRO: Verificar se já existe um registro com este email
      const { data: existingByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', authData.user.email || email)
        .single();

      // Se já existe um usuário com este email, atualizar o ID dele
      if (existingByEmail) {
        const { data: updatedUserData, error: updateError } = await supabase
          .from('users')
          .update({
            id: authData.user.id,
            updated_at: now,
          })
          .eq('email', authData.user.email || email)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Erro ao atualizar perfil do usuário: ${updateError.message}`);
        }

        if (!updatedUserData) {
          throw new Error('Falha ao atualizar perfil do usuário. Tente novamente.');
        }

        const user: User = {
          id: updatedUserData.id,
          email: updatedUserData.email,
          nome: updatedUserData.nome,
          plano: updatedUserData.plano,
          statusAssinatura: updatedUserData.status,
          dataFimAssinatura: updatedUserData.data_fim,
          dataInicioAssinatura: updatedUserData.data_inicio,
          isPremium: false,
          created_at: updatedUserData.created_at,
          updated_at: updatedUserData.updated_at,
        };

        setCurrentUser(user);
        return user;
      }

      // Se não existe, criar novo registro
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email || email,
          nome: authData.user.user_metadata?.nome || authData.user.email?.split('@')[0] || 'Usuário',
          plano: null,
          status: 'nao_assinou',
          data_inicio: null,
          data_fim: null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar perfil do usuário: ${insertError.message}`);
      }

      if (!newUserData) {
        throw new Error('Falha ao criar perfil do usuário. Tente novamente.');
      }

      // Retornar o usuário recém-criado
      const user: User = {
        id: newUserData.id,
        email: newUserData.email,
        nome: newUserData.nome,
        plano: newUserData.plano,
        statusAssinatura: newUserData.status,
        dataFimAssinatura: newUserData.data_fim,
        dataInicioAssinatura: newUserData.data_inicio,
        isPremium: false,
        created_at: newUserData.created_at,
        updated_at: newUserData.updated_at,
      };

      setCurrentUser(user);
      return user;
    }

    // Se houve outro erro ao buscar usuário
    if (userError) {
      throw new Error(`Erro ao carregar dados do usuário: ${userError.message}`);
    }

    if (!userData) {
      throw new Error('Dados do usuário não encontrados. Entre em contato com o suporte.');
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      plano: userData.plano,
      statusAssinatura: userData.status,
      dataFimAssinatura: userData.data_fim,
      dataInicioAssinatura: userData.data_inicio,
      isPremium: false, // Pode ser calculado baseado no plano/status
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    console.log('[AUTH] Login bem-sucedido:', {
      email: user.email,
      status: user.statusAssinatura,
      plano: user.plano,
      data_fim: user.dataFimAssinatura
    });

    // Definir como usuário atual
    setCurrentUser(user);

    return user;
  } catch (error) {
    // Garantir que sempre lançamos um Error
    if (error instanceof Error) {
      throw error;
    }
    // Se não for Error, converter para Error
    throw new Error('Erro desconhecido ao fazer login. Tente novamente.');
  }
}

// Criar novo usuário
export async function createUser(
  nome: string,
  email: string,
  senha: string,
  options: {
    statusAssinatura?: 'ativo' | 'expirado' | 'inativo' | 'nao_assinou';
    plano?: 'nenhum' | 'mensal' | 'trimestral' | null;
    isPremium?: boolean;
  } = {}
): Promise<User> {
  requireSupabase();

  try {
    // Verificar se o email já existe na tabela users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Erro ao verificar email: ${checkError.message}`);
    }

    if (existingUser) {
      throw new Error('Este email já está cadastrado. Tente fazer login ou use outro email.');
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      throw new Error(`Erro ao criar conta: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário');
    }

    // Inserir dados na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        nome,
        plano: options.plano || null,
        status: options.statusAssinatura || 'nao_assinou',
        data_inicio: options.statusAssinatura === 'ativo' ? new Date().toISOString() : null,
        data_fim: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Erro ao salvar dados do usuário: ${userError.message}`);
    }

    const newUser: User = {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      plano: userData.plano,
      statusAssinatura: userData.status,
      dataFimAssinatura: userData.data_fim,
      dataInicioAssinatura: userData.data_inicio,
      isPremium: options.isPremium || false,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    return newUser;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao criar usuário');
  }
}

// Obter todos os usuários (para admin)
export async function getUsers(): Promise<User[]> {
  requireSupabase();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return data.map(user => ({
      id: user.id,
      email: user.email,
      nome: user.nome,
      plano: user.plano,
      statusAssinatura: user.status,
      dataFimAssinatura: user.data_fim,
      dataInicioAssinatura: user.data_inicio,
      isPremium: false, // Pode ser calculado baseado no plano/status
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar usuários');
  }
}

// Atualizar usuário (para admin)
export async function updateUser(
  userId: string,
  updates: Partial<{
    plano: 'nenhum' | 'mensal' | 'trimestral' | null;
    status: 'ativo' | 'expirado' | 'inativo' | 'nao_assinou';
    data_inicio: string;
    data_fim: string;
  }>
): Promise<void> {
  requireSupabase();

  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao atualizar usuário');
  }
}

// Função de logout
export async function logout(): Promise<void> {
  requireSupabase();

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }

    // Limpar usuário atual
    setCurrentUser(null);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao fazer logout');
  }
}
