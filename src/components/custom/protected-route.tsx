'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasActiveSubscription } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // Verificar se tem assinatura ativa
    if (!hasActiveSubscription()) {
      router.push('/');
      return;
    }
  }, [router]);

  // Se não tem assinatura, não renderiza nada (vai redirecionar)
  if (!hasActiveSubscription()) {
    return null;
  }

  return <>{children}</>;
}
