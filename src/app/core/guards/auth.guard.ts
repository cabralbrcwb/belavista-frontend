import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Se o utilizador estiver autenticado, permite o acesso
  }

  // Se não, redireciona para a página de login
  return router.parseUrl('/login');
};
