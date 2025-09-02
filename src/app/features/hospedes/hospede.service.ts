import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura de dados de um Hóspede
export interface Hospede {
  id?: number;
  nome: string;
  documento: string;
  telefone: string;
  email?: string; // Campo adicional mencionado no backend
}

// Interface para filtros de busca
export interface HospedeFilters {
  nome?: string;
  documento?: string;
  telefone?: string;
  email?: string; // Campo adicional para filtro
}

@Injectable({
  providedIn: 'root'
})
export class HospedeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/hospedes';

  /**
   * Busca a lista de hóspedes no backend com filtros opcionais.
   */
  getHospedes(filters?: HospedeFilters): Observable<Hospede[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.nome) {
        params = params.set('nome', filters.nome);
      }
      if (filters.documento) {
        params = params.set('documento', filters.documento);
      }
      if (filters.telefone) {
        params = params.set('telefone', filters.telefone);
      }
      if (filters.email) {
        params = params.set('email', filters.email);
      }
    }

    return this.http.get<Hospede[]>(this.apiUrl, { params });
  }

  /**
   * Cria um novo hóspede
   */
  createHospede(hospede: Hospede): Observable<Hospede> {
    return this.http.post<Hospede>(this.apiUrl, hospede);
  }

  /**
   * Atualiza um hóspede existente
   */
  updateHospede(hospede: Hospede): Observable<Hospede> {
    return this.http.put<Hospede>(`${this.apiUrl}/${hospede.id}`, hospede);
  }

  /**
   * Exclui um hóspede
   */
  deleteHospede(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
