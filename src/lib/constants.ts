// Constantes do aplicativo

export const SUBSCRIPTION_PRICE = 14.90;
export const TRIAL_DAYS = 30;
export const MONTHLY_INVESTMENT_RATE = 0.008; // 0.8% ao mês

export const DEFAULT_CATEGORIES = [
  // Despesas
  { name: 'Alimentação', type: 'expense' as const, color: '#FF6B6B', icon: 'UtensilsCrossed' },
  { name: 'Transporte', type: 'expense' as const, color: '#4ECDC4', icon: 'Car' },
  { name: 'Moradia', type: 'expense' as const, color: '#95E1D3', icon: 'Home' },
  { name: 'Saúde', type: 'expense' as const, color: '#F38181', icon: 'Heart' },
  { name: 'Educação', type: 'expense' as const, color: '#AA96DA', icon: 'GraduationCap' },
  { name: 'Lazer', type: 'expense' as const, color: '#FCBAD3', icon: 'Gamepad2' },
  { name: 'Compras', type: 'expense' as const, color: '#A8D8EA', icon: 'ShoppingBag' },
  { name: 'Contas', type: 'expense' as const, color: '#FFD93D', icon: 'FileText' },
  
  // Receitas
  { name: 'Salário', type: 'income' as const, color: '#6BCF7F', icon: 'Wallet' },
  { name: 'Freelance', type: 'income' as const, color: '#4D96FF', icon: 'Briefcase' },
  { name: 'Investimentos', type: 'income' as const, color: '#9D84B7', icon: 'TrendingUp' },
  { name: 'Outros', type: 'income' as const, color: '#A0C4FF', icon: 'Plus' },
];

export const INSIGHT_MESSAGES = {
  highSpending: (category: string, amount: number) => 
    `Você está gastando acima da média em ${category}. Já foram R$ ${amount.toFixed(2)} este mês.`,
  yearlyProjection: (amount: number) => 
    `Se continuar nesse ritmo, você gastará R$ ${amount.toFixed(2)} em um ano.`,
  investmentPotential: (amount: number, years: number, result: number) => 
    `Investindo R$ ${amount.toFixed(2)}/mês por ${years} anos a 0,8% a.m., você teria R$ ${result.toFixed(2)}.`,
  categoryReduction: (category: string, percentage: number) => 
    `Seu gasto com ${category} caiu ${percentage}% este mês. Parabéns!`,
  savingsTip: (amount: number, category: string) => 
    `Você poderia economizar R$ ${amount.toFixed(2)} reduzindo gastos em ${category}.`,
};
