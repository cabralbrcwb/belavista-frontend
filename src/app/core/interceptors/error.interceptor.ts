import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { ApiErrorResponse, isApiErrorResponse } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      // Helper: tenta extrair mensagem vinda do backend em diferentes formatos
      const getBackendMessage = (err: HttpErrorResponse): string | undefined => {
        const raw = err?.error;
        if (!raw) return undefined;
        // 1) Padrão oficial do backend (ControllerAdvice)
        if (isApiErrorResponse(raw as ApiErrorResponse)) {
          return (raw as ApiErrorResponse).message;
        }
        if (typeof raw === 'string') return raw; // corpo como texto simples
        if (typeof raw?.message === 'string') return raw.message;
        // Alguns backends usam outros campos
        if (typeof raw?.mensagem === 'string') return raw.mensagem;
        if (typeof raw?.detail === 'string') return raw.detail;
        if (typeof raw?.detalhe === 'string') return raw.detalhe;
        if (Array.isArray(raw?.errors) && raw.errors.length > 0) {
          const first = raw.errors[0];
          return first?.message || first?.mensagem || first?.defaultMessage;
        }
        return undefined;
      };

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        notificationService.showError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 0:
            // Falha de rede/CORS/servidor indisponível
            errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e sua conexão de rede.';
            notificationService.showError(errorMessage);
            break;
          case 400:
            // Bad Request - dados inválidos
            errorMessage = getBackendMessage(error) || 'Dados inválidos enviados para o servidor.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 401:
            // Unauthorized - não autenticado
            errorMessage = 'Sessão expirada. Faça login novamente.';
            notificationService.showWarning(errorMessage);
            // Aqui você pode adicionar lógica para redirecionar para login
            break;

          case 403:
            // Forbidden - tentar usar mensagem do backend antes do fallback
            errorMessage = getBackendMessage(error) || 'Você não tem permissão para realizar esta operação.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 404:
            // Not Found
            errorMessage = 'Recurso não encontrado.';
            notificationService.showWarning(errorMessage);
            break;

          case 409:
            // Conflict - geralmente dados duplicados
            errorMessage = getBackendMessage(error) || 'Conflito de dados. O item já existe.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 422:
            // Unprocessable Entity - erro de validação
            errorMessage = getBackendMessage(error) || 'Dados não puderam ser processados. Verifique os campos.';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;

          case 500:
            // Internal Server Error
            errorMessage = getBackendMessage(error) || error.message || 'Erro interno do servidor';
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
            errorMessage = getBackendMessage(error) || error.message || 'Erro inesperado';
            notificationService.showError(notificationService.parseBackendError(errorMessage));
            break;
        }
      }

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
