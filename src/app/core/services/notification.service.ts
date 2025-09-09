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
    // Caso comum: erro de rede/CORS/servidor fora do ar
    if (error && typeof error === 'object') {
      // Angular HttpErrorResponse quando backend está offline tem status 0
      if (typeof (error as any).status === 'number' && (error as any).status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e sua conexão de rede.';
      }
      // Mensagens padrões de falha de rede em diferentes navegadores
      const asString = typeof error === 'string' ? error : (typeof error?.message === 'string' ? error.message : '');
      if (asString) {
        const lower = asString.toLowerCase();
        if (lower.includes('unknown error') || lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network error')) {
          return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e sua conexão de rede.';
        }
      }
    }

    // 1) Normaliza: tenta extrair uma string significativa de objetos comuns
    let msg: string | undefined;

    const tryExtract = (e: any): string | undefined => {
      if (!e) return undefined;
      if (typeof e === 'string') return e;
      // HttpErrorResponse.error pode ser string ou objeto
      if (typeof e?.error === 'string') return e.error;
      // Campos comuns de APIs
      const candidates = [
        e?.message,
        e?.mensagem,
        e?.detail,
        e?.detalhe,
        e?.error,
        e?.title,
        e?.titulo,
      ].filter(Boolean) as string[];
      if (candidates.length > 0) return candidates[0];
      // Listas de erros (ex.: Bean Validation / RFC 7807)
      if (Array.isArray(e?.errors) && e.errors.length > 0) {
        const first = e.errors[0];
        return first?.message || first?.mensagem || first?.defaultMessage || JSON.stringify(first);
      }
      if (Array.isArray(e?.violations) && e.violations.length > 0) {
        const first = e.violations[0];
        return first?.message || first?.mensagem || JSON.stringify(first);
      }
      // Causa encadeada
      if (e?.cause?.message) return e.cause.message;
      return undefined;
    };

    msg = tryExtract(error);
  if (!msg) {
      return 'Ocorreu um erro no servidor. Tente novamente ou entre em contato com o suporte.';
    }

    // 2) Se a mensagem já é amigável (sem termos técnicos), devolve-a diretamente
    const technicalHints = [
      'exception', 'constraint', 'duplicate key', 'sql', 'org.', 'stack trace',
      'violates', 'table', 'column', 'null pointer', 'hibernate', 'jdbc', 'error code',
      'referenced', 'integrity', 'key value', 'unique index'
    ];
    const isTechnical = technicalHints.some(h => msg!.toLowerCase().includes(h));
    if (!isTechnical) {
      return msg.trim();
    }

    // Trata erro de foreign key constraint - não pode deletar porque tem relacionamentos
    if (msg.includes('foreign key constraint') && msg.includes('violates')) {
      if (msg.includes('hospede') && msg.includes('reserva')) {
        return 'Não é possível excluir este hóspede pois ele possui reservas associadas. Remova as reservas primeiro.';
      }
      return 'Não é possível excluir este item pois ele possui dados relacionados. Remova os dados relacionados primeiro.';
    }

    // Trata erro de duplicação de dados únicos
    if (msg.includes('duplicate key') || msg.includes('already exists')) {
      if (msg.includes('email')) {
        return 'Este email já está sendo usado por outro usuário.';
      }
      if (msg.includes('cpf') || msg.includes('documento')) {
        return 'Este documento já está cadastrado no sistema.';
      }
      return 'Este dado já existe no sistema. Use um valor diferente.';
    }

    // Trata erro de validação de dados
    if (msg.includes('validation') || msg.includes('constraint')) {
      return 'Os dados informados não atendem aos critérios de validação. Verifique e tente novamente.';
    }

    // Caso específico: dataSaidaPrevista ausente causando NullPointer/compare
    if (msg.includes('dataSaidaPrevista') && (msg.includes('null') || msg.includes('isBefore'))) {
      return 'Informe a Data de Saída prevista para continuar.';
    }

    // Trata erro de dados não encontrados
    if (msg.includes('not found') || msg.includes('não encontrado')) {
      return 'O item solicitado não foi encontrado.';
    }

    // Trata erro de acesso negado
    if (msg.includes('access denied') || msg.includes('forbidden') || msg.includes('unauthorized')) {
      return 'Você não tem permissão para realizar esta operação.';
    }

    // Trata erro de conexão com banco de dados
    if (msg.includes('connection') || msg.includes('timeout')) {
      return 'Problema de conexão com o servidor. Tente novamente em alguns momentos.';
    }

    // Para outros erros técnicos, extrai a parte mais relevante
    const lines = msg.split('\n');
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
    const detailMatch = msg.match(/Detalhe:\s*([^\.]+)/);
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
