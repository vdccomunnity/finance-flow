'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getUsers, updateUser, type User } from '@/lib/auth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    setIsLoading(true);
    const allUsers = await getUsers();
    setUsers(allUsers);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'AdminFinanceFlow2025@') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  const handleActivateClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowPlanModal(true);
  };

  const handleActivateWithPlan = async (planType: 'mensal' | 'trimestral') => {
    if (!selectedUserId) return;

    const now = new Date();
    const expirationDate = new Date(now);
    
    // Define dias baseado no plano
    const days = planType === 'mensal' ? 30 : 90;
    expirationDate.setDate(expirationDate.getDate() + days);

    await updateUser(selectedUserId, {
      plano: planType,
      status: 'ativo',
      data_inicio: now.toISOString(),
      data_fim: expirationDate.toISOString()
    });

    await loadUsers();
    setSuccessMessage(`Usuário ativado com plano ${planType === 'mensal' ? 'Mensal' : 'Trimestral'}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    
    setShowPlanModal(false);
    setSelectedUserId(null);
  };

  const handleDeactivate = async (userId: string) => {
    const now = new Date();

    await updateUser(userId, {
      status: 'expirado',
      data_fim: now.toISOString()
    });

    await loadUsers();
    setSuccessMessage('Usuário desativado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getSubscriptionStatus = (user: User): 'active' | 'inactive' | 'expired' | 'nao_assinou' => {
    // Verifica se nunca assinou
    if (user.statusAssinatura === 'nao_assinou' || (!user.plano && !user.dataFimAssinatura)) {
      return 'nao_assinou';
    }

    if (user.statusAssinatura === 'ativo' && user.dataFimAssinatura) {
      const now = new Date();
      const fimAssinatura = new Date(user.dataFimAssinatura);
      
      if (now <= fimAssinatura) return 'active';
      return 'expired';
    }
    
    if (user.statusAssinatura === 'expirado') return 'expired';
    return 'inactive';
  };

  const getDaysRemaining = (user: User): number => {
    if (!user.dataFimAssinatura) return 0;
    
    const now = new Date();
    const fimAssinatura = new Date(user.dataFimAssinatura);
    const diffTime = fimAssinatura.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'expired' | 'nao_assinou') => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      nao_assinou: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      expired: 'Expirado',
      nao_assinou: 'Não assinou'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Painel Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Digite a senha para acessar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite a senha"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Painel administrativo
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie usuários e assinaturas do Supabase
          </p>
        </div>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Modal de escolha de plano */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Escolha o Tipo de Assinatura
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Selecione o plano para ativar o usuário:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleActivateWithPlan('mensal')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="text-left">
                    <div className="text-lg font-bold">Plano Mensal</div>
                    <div className="text-sm opacity-90">Válido por 30 dias</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleActivateWithPlan('trimestral')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="text-left">
                    <div className="text-lg font-bold">Plano Trimestral</div>
                    <div className="text-sm opacity-90">Válido por 90 dias</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedUserId(null);
                  }}
                  className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando usuários do Supabase...</p>
          </div>
        )}

        {/* Tabela de usuários */}
        {!isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Dias Restantes
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Nenhum usuário cadastrado no Supabase
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const status = getSubscriptionStatus(user);
                      const daysRemaining = getDaysRemaining(user);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                            {user.nome}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {user.plano || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {status === 'nao_assinou' ? (
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                            ) : (
                              <span className={`font-semibold ${daysRemaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {daysRemaining} dias
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleActivateClick(user.id)}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Ativar
                            </button>
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Desativar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {!isLoading && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Usuários</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {users.filter(u => getSubscriptionStatus(u) === 'active').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Não Assinaram</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {users.filter(u => getSubscriptionStatus(u) === 'nao_assinou').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
