import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// Importe o serviço e a interface
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Um único observable para todas as estatísticas
  public stats$!: Observable<DashboardStats>;

  ngOnInit(): void {
    // Busca os dados quando o componente é inicializado
    this.stats$ = this.dashboardService.getDashboardStats();
  }

  // Função helper para cast seguro
  getStats(stats: any): DashboardStats {
    return stats as DashboardStats;
  }
}
