import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums para status da reserva - ALINHADO COM BACKEND ATUALIZADO
export enum StatusReserva {
  PENDENTE = 'PENDENTE',
  CONFIRMADA = 'CONFIRMADA',
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  CANCELADA = 'CANCELADA'
}

// Interface para Reserva
export interface Reserva {
  id?: number;
  idHospede: number; // Corrigido para alinhar com backend
  hospede?: {
    id: number;
    nome: string;
    documento?: string;
    telefone?: string;
    email?: string;
  }; // Objeto hospede completo como vem do backend
  hospedeNome?: string; // Para retrocompatibilidade
  dataEntrada: string;
  dataSaidaPrevista: string; // Corrigido para coincidir com o backend
  /**
   * Data/hora efetiva do checkout retornada pelo backend após o check-out.
   * Ex.: "2023-10-27T14:30:55.123456". Opcional em reservas ainda não finalizadas.
   */
  dataCheckout?: string;
  adicionalVeiculo: boolean; // Campo obrigatório para estacionamento
  status: StatusReserva;
  valorTotal?: number;
  observacoes?: string;
}

// Interface para filtros de busca
export interface ReservaFilters {
  status?: StatusReserva;
  hospedeNome?: string;
  dataEntrada?: string;
  dataSaidaPrevista?: string; // Corrigido
}

// Interface para resposta do checkout - CORRIGIDA para alinhar com backend
export interface CheckoutResponseDTO {
  /** Data/hora efetiva de checkout (ISO-8601) */
  dataCheckout?: string;
  detalhes: DetalheCustoDTO[];
  valorTotalDiarias: number;
  valorTotalEstacionamento: number;
  valorMultaAtraso: number;
  valorTotalGeral: number;
}

// Interface para detalhe de custo individual
export interface DetalheCustoDTO {
  descricao: string;
  data: string;
  valor: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservas';

  /**
   * Busca a lista de reservas com filtros opcionais
   */
  getReservas(filters?: ReservaFilters): Observable<Reserva[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.hospedeNome) {
        params = params.set('hospedeNome', filters.hospedeNome);
      }
      if (filters.dataEntrada) {
        params = params.set('dataEntrada', filters.dataEntrada);
      }
      if (filters.dataSaidaPrevista) {
        params = params.set('dataSaidaPrevista', filters.dataSaidaPrevista);
      }
    }

    return this.http.get<Reserva[]>(this.apiUrl, { params });
  }

  /**
   * Cria uma nova reserva
   */
  createReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  /**
   * Atualiza uma reserva existente
   */
  updateReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${reserva.id}`, reserva);
  }

  /**
   * Exclui uma reserva
   */
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Realiza check-in de uma reserva
   */
  checkIn(reservaId: number): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/${reservaId}/check-in`, {});
  }

  /**
   * Realiza check-out de uma reserva
   */
  checkOut(reservaId: number): Observable<CheckoutResponseDTO> {
    return this.http.post<CheckoutResponseDTO>(`${this.apiUrl}/${reservaId}/check-out`, {});
  }
}
