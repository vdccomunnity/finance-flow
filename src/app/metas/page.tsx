'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserMetas,
  saveMeta,
  updateMeta as updateMetaData,
  deleteMeta as deleteMetaData,
  type Meta
} from '@/lib/user-data';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/custom/empty-state';
import AppNavbar from '@/components/custom/app-navbar';

export default function MetasPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<Partial<Meta>>({
    nome: '',
    valorTotal: 0,
    valorAlcancado: 0,
    dataInicio: '',
    dataFim: '',
    ativa: true
  });

  useEffect(() => {
    setMounted(true);
    
    const user = getCurrentUser();
    if (user) {
      loadMetas();
    }
  }, [router]);

  const loadMetas = () => {
    const user = getCurrentUser();
    if (user) {
      const userMetas = getUserMetas(user.id);
      setMetas(userMetas);
    }
  };

  // Calcular resumo
  const summary = useMemo(() => {
    const metasAtivas = metas.filter(m => m.ativa);
    const totalMetas = metasAtivas.length;
    const totalValor = metasAtivas.reduce((sum, m) => sum + m.valorTotal, 0);
    const totalAlcancado = metasAtivas.reduce((sum, m) => sum + m.valorAlcancado, 0);
    const metasConcluidas = metasAtivas.filter(m => m.valorAlcancado >= m.valorTotal).length;
    
    return {
      totalMetas,
      totalValor,
      totalAlcancado,
      totalRestante: totalValor - totalAlcancado,
      metasConcluidas
    };
  }, [metas]);

  const formatCurrency = (value: number) => {
    if (!mounted) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    if (!mounted || !dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = (meta?: Meta) => {
    if (meta) {
      setIsEditMode(true);
      setCurrentMeta(meta);
    } else {
      setIsEditMode(false);
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setCurrentMeta({
        nome: '',
        valorTotal: 0,
        valorAlcancado: 0,
        dataInicio: dateString,
        dataFim: '',
        ativa: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentMeta({
      nome: '',
      valorTotal: 0,
      valorAlcancado: 0,
      dataInicio: dateString,
      dataFim: '',
      ativa: true
    });
  };

  const handleSaveMeta = () => {
    if (!currentMeta.nome || !currentMeta.valorTotal || !currentMeta.dataInicio) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (isEditMode && currentMeta.id) {
        updateMetaData(currentMeta.id, currentMeta as Meta);
      } else {
        saveMeta(currentMeta as Omit<Meta, 'id' | 'userId'>);
      }
      loadMetas();
      handleCloseModal();
    } catch (error) {
      alert('Erro ao salvar meta');
    }
  };

  const handleDeleteMeta = (id: string) => {
    deleteMetaData(id);
    loadMetas();
    setDeleteConfirmId(null);
  };

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
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Título */}
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Metas Financeiras</h1>
          </div>

          {/* Cards de Resumo */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/30 to-cyan-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total de Metas</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{summary.totalMetas}</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Valor Total</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-pink-400/30">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(summary.totalValor)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Já Alcançado</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(summary.totalAlcancado)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400/30 to-purple-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Metas Concluídas</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400/30 to-purple-400/30">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{summary.metasConcluidas}</div>
            </div>
          </section>

          {/* Botão Nova Meta */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Suas Metas</h2>
                <p className="text-sm text-gray-400">Defina e acompanhe seus objetivos financeiros</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Plus className="w-5 h-5" />
                Nova Meta
              </button>
            </div>
          </section>

          {/* Grid de Metas ou Estado Vazio */}
          {metas.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metas.map((meta) => {
                const percentualAlcancado = meta.valorTotal > 0 
                  ? (meta.valorAlcancado / meta.valorTotal) * 100 
                  : 0;
                const restante = meta.valorTotal - meta.valorAlcancado;
                const concluida = meta.valorAlcancado >= meta.valorTotal;

                return (
                  <div
                    key={meta.id}
                    className={`backdrop-blur-xl bg-[#1a1a24]/60 border rounded-2xl p-6 transition-all relative overflow-hidden ${
                      concluida
                        ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10'
                        : 'border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'
                    } ${!meta.ativa ? 'opacity-60' : ''}`}
                  >
                    {/* Accent gradient no topo */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        concluida 
                          ? 'bg-gradient-to-r from-green-400/50 to-emerald-400/50' 
                          : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'
                      }`} 
                    />

                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{meta.nome}</h3>
                        {concluida && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Concluída
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(meta)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(meta.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Valor Total</span>
                        <span className="text-lg font-semibold text-white">
                          R$ {formatCurrency(meta.valorTotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Já Alcançado</span>
                        <span className="text-lg font-semibold text-green-400">
                          R$ {formatCurrency(meta.valorAlcancado)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Restante</span>
                        <span className={`text-lg font-semibold ${restante <= 0 ? 'text-green-400' : 'text-white'}`}>
                          R$ {formatCurrency(Math.max(0, restante))}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Progresso</span>
                        <span className={`font-semibold ${concluida ? 'text-green-400' : 'text-purple-400'}`}>
                          {percentualAlcancado.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-[#0f0f17]/80 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            concluida
                              ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80'
                              : 'bg-gradient-to-r from-blue-500/80 to-purple-600/80'
                          }`}
                          style={{ width: `${Math.min(percentualAlcancado, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Datas */}
                    {(meta.dataInicio || meta.dataFim) && (
                      <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-xs text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {meta.dataInicio && <span>{formatDate(meta.dataInicio)}</span>}
                        {meta.dataInicio && meta.dataFim && <span>→</span>}
                        {meta.dataFim && <span>{formatDate(meta.dataFim)}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          ) : (
            <EmptyState
              icon={Target}
              title="Nenhuma meta cadastrada"
              description="Comece definindo suas metas financeiras para acompanhar seu progresso."
              action={{
                label: "Nova Meta",
                onClick: () => handleOpenModal()
              }}
            />
          )}
        </main>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 backdrop-blur-xl rounded-full shadow-2xl shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 z-50 border border-white/10"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Modal Nova/Editar Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-purple-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? 'Editar Meta' : 'Nova Meta'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome da Meta *</label>
                <input
                  type="text"
                  value={currentMeta.nome}
                  onChange={(e) => setCurrentMeta({
                    ...currentMeta,
                    nome: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="Ex: Viagem para Europa"
                />
              </div>

              {/* Valor Total */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">R$ Valor Total *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentMeta.valorTotal || ''}
                  onChange={(e) => setCurrentMeta({
                    ...currentMeta,
                    valorTotal: parseFloat(e.target.value) || 0
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Valor Alcançado */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">R$ Valor Já Alcançado</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentMeta.valorAlcancado || ''}
                  onChange={(e) => setCurrentMeta({
                    ...currentMeta,
                    valorAlcancado: parseFloat(e.target.value) || 0
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data de Início *</label>
                <input
                  type="date"
                  value={currentMeta.dataInicio}
                  onChange={(e) => setCurrentMeta({
                    ...currentMeta,
                    dataInicio: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data de Conclusão (opcional)</label>
                <input
                  type="date"
                  value={currentMeta.dataFim}
                  onChange={(e) => setCurrentMeta({
                    ...currentMeta,
                    dataFim: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
              </div>

              {/* Toggle Ativa */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm text-gray-400">Meta ativa</label>
                <button
                  onClick={() => setCurrentMeta({
                    ...currentMeta,
                    ativa: !currentMeta.ativa
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentMeta.ativa ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentMeta.ativa ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMeta}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                {isEditMode ? 'Salvar Alterações' : 'Salvar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-red-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-300 mb-6">
              Você realmente deseja excluir esta meta?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteMeta(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
