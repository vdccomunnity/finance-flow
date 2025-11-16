'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, hasAccess } from '@/lib/auth';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/', '/login', '/criar-conta', '/upgrade'];

// Rotas que precisam de autenticação mas não verificam acesso premium
const AUTH_ONLY_ROUTES = ['/upgrade'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar se é rota pública
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    if (isPublicRoute) {
      return; // Permitir acesso a rotas públicas
    }

    // Verificar autenticação
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Verificar se é rota que só precisa de autenticação (não verifica premium)
    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.includes(pathname);
    if (isAuthOnlyRoute) {
      return;
    }

    // Verificar acesso (teste gratuito ou premium)
    if (!hasAccess()) {
      router.push('/upgrade');
      return;
    }
  }, [pathname, router]);

  return <>{children}</>;
}
