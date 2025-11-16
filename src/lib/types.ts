// Tipos do aplicativo financeiro

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  userId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  monthlyLimit?: number;
  userId: string;
  icon?: string;
}

export type GoalPriority = 'high' | 'medium' | 'low';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: GoalPriority;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  description: string;
  category?: string;
  amount?: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  trialEndDate: Date;
  isAdmin: boolean;
  preferences: {
    theme: 'dark' | 'light';
    accentColor: string;
    notifications: boolean;
  };
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
}
