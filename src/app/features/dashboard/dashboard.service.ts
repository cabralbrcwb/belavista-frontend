import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

// Uma interface para a resposta resumida do dashboard
export interface DashboardStats {
  reservasPendentes: number;
  checkinsAtivos: number;
  totalHospedes: number;
  totalReservas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private reservasApiUrl = 'http://localhost:8080/api/reservas';

  // Este método vai buscar todos os dados necessários para o dashboard de uma só vez
  getDashboardStats(): Observable<DashboardStats> {
    // Criamos observables para cada chamada de API
    const reservasPendentes$ = this.http
      .get<any[]>(this.reservasApiUrl, { params: new HttpParams().set('status', 'PENDENTE') })
      .pipe(catchError(() => of([])));
    const checkinsAtivos$ = this.http
      .get<any[]>(this.reservasApiUrl, { params: new HttpParams().set('status', 'CHECK_IN') })
      .pipe(catchError(() => of([])));
    const totalReservas$ = this.http
      .get<any[]>(this.reservasApiUrl)
      .pipe(catchError(() => of([])));
    const totalHospedes$ = this.http
      .get<any[]>('http://localhost:8080/api/hospedes')
      .pipe(catchError(() => of([])));

    // O forkJoin executa todas as chamadas em paralelo e só retorna quando todas terminarem
    return forkJoin([reservasPendentes$, checkinsAtivos$, totalReservas$, totalHospedes$]).pipe(
      map(([reservasPendentes, checkinsAtivos, totalReservas, totalHospedes]) => {
        // Transformamos a resposta num único objeto de estatísticas
        return {
          reservasPendentes: reservasPendentes.length,
          checkinsAtivos: checkinsAtivos.length,
          totalReservas: totalReservas.length,
          totalHospedes: totalHospedes.length
        };
  }),
  catchError(error => {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        // Retorna dados simulados em caso de erro
        return of({
          reservasPendentes: 0,
          checkinsAtivos: 0,
          totalReservas: 0,
          totalHospedes: 0
        });
      })
    );
  }
}
