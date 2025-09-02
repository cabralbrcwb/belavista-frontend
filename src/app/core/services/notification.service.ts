import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  showSuccess(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 8000, // Erro fica mais tempo visível
      panelClass: ['error-snackbar']
    });
  }

  showWarning(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar']
    });
  }

  showInfo(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Converte erros técnicos do backend em mensagens amigáveis
   */
  parseBackendError(error: any): string {
    if (!error || typeof error !== 'string') {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    // Trata erro de foreign key constraint - não pode deletar porque tem relacionamentos
    if (error.includes('foreign key constraint') && error.includes('violates')) {
      if (error.includes('hospede') && error.includes('reserva')) {
        return 'Não é possível excluir este hóspede pois ele possui reservas associadas. Remova as reservas primeiro.';
      }
      return 'Não é possível excluir este item pois ele possui dados relacionados. Remova os dados relacionados primeiro.';
    }

    // Trata erro de duplicação de dados únicos
    if (error.includes('duplicate key') || error.includes('already exists')) {
      if (error.includes('email')) {
        return 'Este email já está sendo usado por outro usuário.';
      }
      if (error.includes('cpf') || error.includes('documento')) {
        return 'Este documento já está cadastrado no sistema.';
      }
      return 'Este dado já existe no sistema. Use um valor diferente.';
    }

    // Trata erro de validação de dados
    if (error.includes('validation') || error.includes('constraint')) {
      return 'Os dados informados não atendem aos critérios de validação. Verifique e tente novamente.';
    }

    // Trata erro de dados não encontrados
    if (error.includes('not found') || error.includes('não encontrado')) {
      return 'O item solicitado não foi encontrado.';
    }

    // Trata erro de acesso negado
    if (error.includes('access denied') || error.includes('forbidden') || error.includes('unauthorized')) {
      return 'Você não tem permissão para realizar esta operação.';
    }

    // Trata erro de conexão com banco de dados
    if (error.includes('connection') || error.includes('timeout')) {
      return 'Problema de conexão com o servidor. Tente novamente em alguns momentos.';
    }

    // Para outros erros técnicos, extrai a parte mais relevante
    const lines = error.split('\n');
    const firstLine = lines[0] || '';
    
    // Tenta extrair mensagem entre colchetes [ERROR: ...]
    const errorMatch = firstLine.match(/\[ERROR:\s*([^\]]+)\]/);
    if (errorMatch) {
      const errorMsg = errorMatch[1].trim();
      // Se for uma mensagem técnica, traduz
      if (errorMsg.includes('violates foreign key constraint')) {
        return 'Não é possível excluir este item pois ele possui dados relacionados.';
      }
      return this.translateTechnicalMessage(errorMsg);
    }

    // Tenta extrair mensagem após "Detalhe:"
    const detailMatch = error.match(/Detalhe:\s*([^\.]+)/);
    if (detailMatch) {
      return this.translateTechnicalMessage(detailMatch[1].trim());
    }

    // Se não conseguiu extrair nada específico, retorna mensagem genérica
    return 'Ocorreu um erro no servidor. Tente novamente ou entre em contato com o suporte.';
  }

  private translateTechnicalMessage(message: string): string {
    if (message.includes('is still referenced')) {
      return 'Este item não pode ser removido pois está sendo usado em outros registros.';
    }
    
    if (message.includes('Key') && message.includes('referenced')) {
      return 'Este registro está sendo usado em outros locais e não pode ser excluído.';
    }

    // Retorna uma versão mais limpa da mensagem técnica
    return message.charAt(0).toUpperCase() + message.slice(1) + '.';
  }
}
