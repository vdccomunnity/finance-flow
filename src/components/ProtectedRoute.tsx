'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Aguardar o carregamento do contexto
    if (isLoading) return;
    
    // Marcar que já verificou
    if (!hasChecked) {
      setHasChecked(true);
    }
    
    // Se não tem usuário logado, redirecionar para login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Verificar se tem assinatura ativa
    // IMPORTANTE: Verificar APENAS se o status é 'ativo'
    // Ignorar data_fim para evitar problemas de timezone/comparação
    const hasAccess = user.statusAssinatura === 'ativo';
    
    if (!hasAccess) {
      // Redirecionar para landing page
      router.push('/');
    }
  }, [user, isLoading, router, hasChecked]);

  // Mostrar loading enquanto está verificando
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-white text-sm">Verificando acesso...</div>
        </div>
      </div>
    );
  }

  // Se não tem usuário ou não tem assinatura ativa, não renderizar (useEffect vai redirecionar)
  if (!user || user.statusAssinatura !== 'ativo') {
    return null;
  }

  return <>{children}</>;
}
