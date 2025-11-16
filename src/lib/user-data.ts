// Sistema centralizado de dados do usuário
// Gerencia transações, categorias, metas e cálculos

import { getCurrentUser } from './auth';

// Types
export interface Transaction {
  id: string;
  userId: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface Categoria {
  id: string;
  userId: string;
  nome: string;
  icone: string;
  cor?: string;
  orcamentoMensal: number;
  ativa: boolean;
  tipo: 'receita' | 'despesa'; // NOVO CAMPO
}

export interface Meta {
  id: string;
  userId: string;
  nome: string;
  descricao: string;
  valorObjetivo: number;
  valorAtual: number;
  dataLimite: string;
  prioridade: 'alta' | 'media' | 'baixa';
  categoria: string;
  status: 'ativa' | 'concluida' | 'atrasada' | 'cancelada';
}

// Storage keys
const TRANSACTIONS_KEY = 'financeflow_transactions';
const CATEGORIAS_KEY = 'financeflow_categorias';
const METAS_KEY = 'financeflow_metas';

// ============================================
// TRANSAÇÕES
// ============================================

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserTransactions = (userId: string): Transaction[] => {
  return getTransactions().filter(t => t.userId === userId);
};

export const saveTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>): Transaction => {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    userId: user.id
  };

  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions().filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// ============================================
// CATEGORIAS
// ============================================

export const getCategorias = (): Categoria[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CATEGORIAS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserCategorias = (userId: string): Categoria[] => {
  return getCategorias().filter(c => c.userId === userId);
};

export const saveCategoria = (categoria: Omit<Categoria, 'id' | 'userId'>): Categoria => {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const categorias = getCategorias();
  const newCategoria: Categoria = {
    ...categoria,
    id: crypto.randomUUID(),
    userId: user.id
  };

  categorias.push(newCategoria);
  localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
  return newCategoria;
};

export const updateCategoria = (id: string, updates: Partial<Categoria>): void => {
  const categorias = getCategorias();
  const index = categorias.findIndex(c => c.id === id);
  if (index !== -1) {
    categorias[index] = { ...categorias[index], ...updates };
    localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
  }
};

export const deleteCategoria = (id: string): void => {
  const categorias = getCategorias().filter(c => c.id !== id);
  localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
};

// ============================================
// METAS
// ============================================

export const getMetas = (): Meta[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(METAS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserMetas = (userId: string): Meta[] => {
  return getMetas().filter(m => m.userId === userId);
};

export const saveMeta = (meta: Omit<Meta, 'id' | 'userId'>): Meta => {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const metas = getMetas();
  const newMeta: Meta = {
    ...meta,
    id: crypto.randomUUID(),
    userId: user.id
  };

  metas.push(newMeta);
  localStorage.setItem(METAS_KEY, JSON.stringify(metas));
  return newMeta;
};

export const updateMeta = (id: string, updates: Partial<Meta>): void => {
  const metas = getMetas();
  const index = metas.findIndex(m => m.id === id);
  if (index !== -1) {
    metas[index] = { ...metas[index], ...updates };
    localStorage.setItem(METAS_KEY, JSON.stringify(metas));
  }
};

export const deleteMeta = (id: string): void => {
  const metas = getMetas().filter(m => m.id !== id);
  localStorage.setItem(METAS_KEY, JSON.stringify(metas));
};

// ============================================
// CÁLCULOS E ESTATÍSTICAS
// ============================================

/**
 * Calcula totais de receitas e despesas para um período
 * RETORNA R$ 0,00 se não houver dados
 */
export const calculateTotals = (
  transactions: Transaction[],
  month?: number,
  year?: number
) => {
  let filtered = transactions;

  if (month !== undefined && year !== undefined) {
    filtered = transactions.filter(t => {
      const date = new Date(t.data);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }

  const receitas = filtered
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const despesas = filtered
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    quantidade: filtered.length
  };
};

/**
 * Calcula gastos por categoria
 * RETORNA objeto vazio se não houver dados
 */
export const calculateGastosPorCategoria = (
  transactions: Transaction[],
  month?: number,
  year?: number
): { [categoria: string]: number } => {
  let filtered = transactions.filter(t => t.tipo === 'despesa');

  if (month !== undefined && year !== undefined) {
    filtered = filtered.filter(t => {
      const date = new Date(t.data);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }

  const gastos: { [categoria: string]: number } = {};
  filtered.forEach(t => {
    gastos[t.categoria] = (gastos[t.categoria] || 0) + t.valor;
  });

  return gastos;
};

/**
 * Calcula receitas por categoria
 * RETORNA objeto vazio se não houver dados
 */
export const calculateReceitasPorCategoria = (
  transactions: Transaction[],
  month?: number,
  year?: number
): { [categoria: string]: number } => {
  let filtered = transactions.filter(t => t.tipo === 'receita');

  if (month !== undefined && year !== undefined) {
    filtered = filtered.filter(t => {
      const date = new Date(t.data);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }

  const receitas: { [categoria: string]: number } = {};
  filtered.forEach(t => {
    receitas[t.categoria] = (receitas[t.categoria] || 0) + t.valor;
  });

  return receitas;
};

/**
 * Calcula resumo de categorias vs orçamentos
 * RETORNA valores zerados se não houver dados
 */
export const calculateCategoriasSummary = (
  categorias: Categoria[],
  gastos: { [categoria: string]: number }
) => {
  const categoriasAtivas = categorias.filter(c => c.ativa);
  const orcamentoTotal = categoriasAtivas.reduce((sum, c) => sum + c.orcamentoMensal, 0);
  const gastoTotal = Object.values(gastos).reduce((sum, valor) => sum + valor, 0);
  const saldo = orcamentoTotal - gastoTotal;

  const categoriasEstouradas = categoriasAtivas.filter(c => {
    const gasto = gastos[c.nome] || 0;
    return gasto > c.orcamentoMensal;
  }).length;

  return {
    orcamentoTotal,
    gastoTotal,
    saldo,
    categoriasEstouradas
  };
};

/**
 * Calcula resumo de metas
 * RETORNA valores zerados se não houver dados
 */
export const calculateMetasSummary = (metas: Meta[]) => {
  const metasAtivas = metas.filter(m => m.status === 'ativa');
  const totalPoupado = metasAtivas.reduce((sum, m) => sum + m.valorAtual, 0);
  const totalObjetivos = metasAtivas.reduce((sum, m) => sum + m.valorObjetivo, 0);
  const progressoMedio = metasAtivas.length > 0
    ? metasAtivas.reduce((sum, m) => sum + (m.valorAtual / m.valorObjetivo), 0) / metasAtivas.length * 100
    : 0;

  // Próximo prazo
  const metasOrdenadas = [...metasAtivas].sort((a, b) => 
    new Date(a.dataLimite).getTime() - new Date(b.dataLimite).getTime()
  );
  const proximaMeta = metasOrdenadas[0] || null;

  return {
    totalPoupado,
    totalObjetivos,
    progressoMedio,
    proximaMeta
  };
};

/**
 * Verifica se usuário tem dados cadastrados
 * Usado para mostrar estados vazios
 */
export const userHasData = (userId: string): boolean => {
  const transactions = getUserTransactions(userId);
  const categorias = getUserCategorias(userId);
  const metas = getUserMetas(userId);

  return transactions.length > 0 || categorias.length > 0 || metas.length > 0;
};
