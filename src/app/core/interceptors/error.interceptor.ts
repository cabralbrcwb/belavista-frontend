import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        notificationService.showError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 400:
            // Bad Request - dados inválidos
            errorMessage = error.error?.message || 'Dados inválidos enviados para o servidor.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 401:
            // Unauthorized - não autenticado
            errorMessage = 'Sessão expirada. Faça login novamente.';
            notificationService.showWarning(errorMessage);
            // Aqui você pode adicionar lógica para redirecionar para login
            break;

          case 403:
            // Forbidden - sem permissão
            errorMessage = 'Você não tem permissão para realizar esta operação.';
            notificationService.showError(errorMessage);
            break;

          case 404:
            // Not Found
            errorMessage = 'Recurso não encontrado.';
            notificationService.showWarning(errorMessage);
            break;

          case 409:
            // Conflict - geralmente dados duplicados
            errorMessage = error.error?.message || 'Conflito de dados. O item já existe.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 422:
            // Unprocessable Entity - erro de validação
            errorMessage = error.error?.message || 'Dados não puderam ser processados. Verifique os campos.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 500:
            // Internal Server Error
            errorMessage = error.error?.message || error.message || 'Erro interno do servidor';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 502:
          case 503:
          case 504:
            // Server errors
            errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns momentos.';
            notificationService.showError(errorMessage);
            break;

          default:
            // Outros erros
            errorMessage = error.error?.message || error.message || 'Erro inesperado';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;
        }
      }

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
