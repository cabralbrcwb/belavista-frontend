import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura de dados de um Hóspede
export type TipoDocumento = 'RG' | 'CPF' | 'PASSAPORTE' | 'CNH';

export interface Hospede {
  id?: number;
  nome: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefone: string;
  email?: string; // Campo adicional mencionado no backend
}

// Interface para filtros de busca
export interface HospedeFilters {
  nome?: string;
  tipoDocumento?: TipoDocumento;
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

  private normalizeDocumento(tipo: TipoDocumento | undefined, documento: string | undefined): string {
    const v = (documento || '');
    if (!tipo) {
      // fallback: remove tudo que não é alfanumérico
      return v.replace(/[^A-Za-z0-9]/g, '');
    }
    switch (tipo) {
      case 'CPF':
      case 'RG':
      case 'CNH':
        return v.replace(/\D/g, '');
      case 'PASSAPORTE':
        return v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      default:
        return v.replace(/[^A-Za-z0-9]/g, '');
    }
  }

  /**
   * Busca a lista de hóspedes no backend com filtros opcionais.
   */
  getHospedes(filters?: HospedeFilters): Observable<Hospede[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.nome) {
        params = params.set('nome', filters.nome);
      }
      if (filters.tipoDocumento) {
        params = params.set('tipoDocumento', filters.tipoDocumento);
      }
      if (filters.documento) {
        params = params.set('documento', this.normalizeDocumento(filters.tipoDocumento, filters.documento));
      }
      if (filters.telefone) {
        // envia apenas dígitos
        params = params.set('telefone', filters.telefone.replace(/\D/g, ''));
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
    const payload: Hospede = {
      ...hospede,
      telefone: (hospede.telefone || '').replace(/\D/g, ''),
      documento: this.normalizeDocumento(hospede.tipoDocumento, hospede.documento)
    } as Hospede;
    return this.http.post<Hospede>(this.apiUrl, payload);
  }

  /**
   * Atualiza um hóspede existente
   */
  updateHospede(hospede: Hospede): Observable<Hospede> {
    const payload: Hospede = {
      ...hospede,
      telefone: (hospede.telefone || '').replace(/\D/g, ''),
      documento: this.normalizeDocumento(hospede.tipoDocumento, hospede.documento)
    } as Hospede;
    return this.http.put<Hospede>(`${this.apiUrl}/${hospede.id}`, payload);
  }

  /**
   * Exclui um hóspede
   */
  deleteHospede(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
