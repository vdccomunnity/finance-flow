'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  User,
  CreditCard,
  Bell,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  AlertCircle,
  FileText,
  Save,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, logout as authLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppNavbar from '@/components/custom/app-navbar';

// Types
interface UserProfile {
  nome: string;
  email: string;
  telefone: string;
}

interface Subscription {
  status: 'ativa' | 'expirada' | 'nenhuma';
  dataInicio?: string;
  dataRenovacao?: string;
  proximaCobranca?: string;
  plano: string;
  valor: number;
}

interface NotificationSettings {
  categoriaLimite: boolean;
  metaAtrasada: boolean;
  lembretesDiarios: boolean;
  resumoSemanal: boolean;
  movimentacoesIncomuns: boolean;
}

function ConfiguracoesContent() {
  const router = useRouter();
  
  // Estado para controlar hydration
  const [mounted, setMounted] = useState(false);

  // Estados
  const [profile, setProfile] = useState<UserProfile>({
    nome: 'Usuário',
    email: 'usuario@email.com',
    telefone: ''
  });

  const [subscription, setSubscription] = useState<Subscription>({
    status: 'nenhuma',
    plano: 'Premium',
    valor: 19.90
  });

  const [diasRestantes, setDiasRestantes] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    categoriaLimite: true,
    metaAtrasada: true,
    lembretesDiarios: false,
    resumoSemanal: true,
    movimentacoesIncomuns: true
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Effect para marcar componente como montado e carregar dados do usuário
  useEffect(() => {
    setMounted(true);
    
    const user = getCurrentUser();
    if (user) {
      setProfile({
        nome: user.nome,
        email: user.email,
        telefone: ''
      });
      
      // Verificar se tem assinatura ativa
      const hasActiveSubscription = user.statusAssinatura === 'ativo';
      setIsPremium(hasActiveSubscription);
      
      // Calcular dias restantes se houver data de fim
      let dias = 0;
      if (user.dataFimAssinatura) {
        const dataFim = new Date(user.dataFimAssinatura);
        const hoje = new Date();
        const diffTime = dataFim.getTime() - hoje.getTime();
        dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dias < 0) dias = 0;
      }
      setDiasRestantes(dias);
      
      // Definir status da assinatura
      if (hasActiveSubscription) {
        setSubscription({
          status: 'ativa',
          plano: user.plano === 'mensal' ? 'Mensal' : user.plano === 'trimestral' ? 'Trimestral' : 'Premium',
          valor: user.plano === 'mensal' ? 19.90 : user.plano === 'trimestral' ? 49.90 : 19.90,
          dataInicio: user.dataInicioAssinatura || undefined,
          dataRenovacao: user.dataFimAssinatura || undefined
        });
      } else if (user.statusAssinatura === 'expirado') {
        setSubscription({
          status: 'expirada',
          plano: 'Assinatura Expirada',
          valor: 0
        });
      } else {
        setSubscription({
          status: 'nenhuma',
          plano: 'Nenhum plano ativo',
          valor: 0
        });
      }
    }
  }, []);

  // Handlers
  const handleSaveProfile = () => {
    alert('Perfil atualizado com sucesso!');
  };

  const handleExportPDF = () => {
    alert('Exportando relatório em PDF...');
  };

  const handleExportCSV = () => {
    alert('Exportando transações em CSV...');
  };

  const handleBackup = () => {
    alert('Gerando backup...');
  };

  const handleRestore = () => {
    alert('Restaurando backup...');
  };

  const handleResetData = () => {
    // Limpar todos os dados do localStorage relacionados ao app
    const keysToRemove = [
      'financeflow_transactions',
      'financeflow_categorias',
      'financeflow_metas'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    alert('Todos os dados foram resetados com sucesso!');
    setShowResetModal(false);
    
    // Recarregar a página para refletir as mudanças
    window.location.reload();
  };

  const handleLogout = () => {
    authLogout();
    router.push('/login');
    setShowLogoutModal(false);
  };

  const handleSubscribe = () => {
    router.push('/');
  };

  const handleCancelSubscription = () => {
    alert('Cancelando assinatura...');
  };

  const handleChangePayment = () => {
    alert('Alterando método de pagamento...');
  };

  const handleViewInvoice = () => {
    alert('Visualizando fatura...');
  };

  // Renderizar loading state durante hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <AppNavbar />

      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
          {/* Título */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Configurações</h1>
            </div>
            <p className="text-gray-400">Gerencie sua conta, preferências e dados do aplicativo.</p>
          </div>

          {/* SEÇÃO 1 - Informações Pessoais */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Informações Pessoais</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome do usuário</label>
                <input
                  type="text"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={profile.telefone}
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Save className="w-5 h-5" />
                Salvar alterações
              </button>
            </div>
          </section>

          {/* SEÇÃO 2 - Assinatura */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Gerenciar Plano</h2>
            </div>

            {/* Status da Assinatura */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'ativa'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : subscription.status === 'expirada'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {subscription.status === 'ativa' ? 'Ativa' : subscription.status === 'expirada' ? 'Expirada' : 'Nenhuma assinatura ativa'}
                </span>
              </div>

              {/* Banner de acordo com status */}
              {subscription.status === 'expirada' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium mb-1">Sua assinatura expirou</p>
                      <p className="text-sm text-red-300/80">Para continuar usando o FinanceFlow, renove seu plano.</p>
                    </div>
                  </div>
                </div>
              )}

              {subscription.status === 'nenhuma' && !isPremium && diasRestantes > 0 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-400 font-medium mb-1">🎉 Teste Gratuito Ativo</p>
                      <p className="text-sm text-blue-300/80 mb-2">
                        Você tem <strong className="text-white">{diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</strong> restantes de teste gratuito.
                      </p>
                      <p className="text-xs text-gray-400">
                        Aproveite todos os recursos premium sem compromisso. Após o período, escolha um plano para continuar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {subscription.status === 'nenhuma' && !isPremium && diasRestantes === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium mb-1">Você ainda não tem assinatura ativa</p>
                      <p className="text-sm text-blue-300/80">Assine agora e tenha acesso a todos os recursos premium.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detalhes da assinatura ativa */}
              {subscription.status === 'ativa' && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Plano atual</span>
                    <span className="text-white font-semibold">{subscription.plano} - R$ {subscription.valor.toFixed(2)}/mês</span>
                  </div>
                  {subscription.dataInicio && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Data de início</span>
                      <span className="text-white">{new Date(subscription.dataInicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {subscription.dataRenovacao && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Data de renovação</span>
                      <span className="text-white">{new Date(subscription.dataRenovacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {subscription.proximaCobranca && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Próxima cobrança</span>
                      <span className="text-white">{new Date(subscription.proximaCobranca).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              {subscription.status === 'ativa' && (
                <>
                  <button
                    onClick={handleChangePayment}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
                  >
                    Alterar método de pagamento
                  </button>
                  <button
                    onClick={handleViewInvoice}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
                  >
                    Ver fatura
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-all"
                  >
                    Cancelar assinatura
                  </button>
                </>
              )}

              {subscription.status === 'expirada' && (
                <button
                  onClick={handleSubscribe}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  Renovar Assinatura
                </button>
              )}

              {subscription.status === 'nenhuma' && (
                <button
                  onClick={handleSubscribe}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  Ver Planos Disponíveis
                </button>
              )}
            </div>
          </section>

          {/* SEÇÃO 3 - Preferências de Notificação */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Preferências de Notificação</h2>
            </div>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Categoria perto do limite</p>
                  <p className="text-sm text-gray-400">Notificar quando categoria estiver perto do limite</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, categoriaLimite: !notifications.categoriaLimite })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications.categoriaLimite ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.categoriaLimite ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Meta atrasada</p>
                  <p className="text-sm text-gray-400">Notificar quando meta estiver atrasada</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, metaAtrasada: !notifications.metaAtrasada })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications.metaAtrasada ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.metaAtrasada ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Lembrete diário</p>
                  <p className="text-sm text-gray-400">Registrar suas despesas do dia</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, lembretesDiarios: !notifications.lembretesDiarios })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications.lembretesDiarios ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.lembretesDiarios ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Toggle 4 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Resumo semanal</p>
                  <p className="text-sm text-gray-400">Notificar resumo semanal</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, resumoSemanal: !notifications.resumoSemanal })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications.resumoSemanal ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.resumoSemanal ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Toggle 5 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Movimentações incomuns</p>
                  <p className="text-sm text-gray-400">Notificar movimentações incomuns</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, movimentacoesIncomuns: !notifications.movimentacoesIncomuns })}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications.movimentacoesIncomuns ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.movimentacoesIncomuns ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4 - Exportar Dados */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400/30 to-purple-400/30">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Exportar Dados</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Exportar PDF (Relatório do Mês)
              </button>

              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar CSV (Todas as transações)
              </button>
            </div>

            <div className="mt-4 p-3 bg-[#0f0f17]/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">
                O PDF contém: Receitas, Despesas, Categorias, Fluxo mensal e Resumo da economia.
              </p>
            </div>
          </section>

          {/* SEÇÃO 5 - Backup & Restore */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Backup & Restore</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackup}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Upload className="w-5 h-5" />
                Gerar Backup Agora
              </button>

              <button
                onClick={handleRestore}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Restaurar Backup
              </button>
            </div>

            <div className="mt-4 p-3 bg-[#0f0f17]/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">
                Seu backup inclui transações, categorias, metas e configurações.
              </p>
            </div>
          </section>

          {/* SEÇÃO 6 - Resetar Dados */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-400/30 to-orange-400/30">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Redefinir Dados do Aplicativo</h2>
            </div>

            <div className="mb-4">
              <p className="text-gray-300">
                Essa ação apagará todas as suas transações, categorias e metas. Não pode ser desfeita.
              </p>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Resetar Todos os Dados
            </button>
          </section>

          {/* Rodapé - Sair da conta */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        </main>
      </div>

      {/* Modal Confirmação Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Confirmar Reset</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza? Seus dados serão apagados permanentemente e essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/20"
              >
                Resetar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-purple-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <LogOut className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Sair da Conta</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja sair da sua conta?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <ConfiguracoesContent />
    </ProtectedRoute>
  );
}
