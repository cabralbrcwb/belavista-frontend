import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o nosso serviço de autenticação
  const authService = inject(AuthService);

  // Pega o token que guardámos no localStorage
  const authToken = authService.getToken();

  // Se existir um token, vamos clonar o pedido e adicionar o cabeçalho
  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });

    // Envia o pedido clonado (com o cabeçalho) em vez do original
    return next(authReq);
  }

  // Se não houver token, apenas deixa o pedido original continuar
  return next(req);
};
