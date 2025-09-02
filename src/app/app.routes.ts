import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Altera a rota de login para ser explícita
  { path: 'login', component: LoginComponent },

  // Rota Principal Protegida (a "casca" da aplicação)
  {
    path: '', // Agora, a rota raiz '' é a protegida
    component: LayoutComponent,
    canActivate: [authGuard], // O guarda protege esta rota e todas as suas filhas
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // ---- ROTAS DOS MÓDULOS ----
      {
        path: 'reservas',
        loadComponent: () => import('./features/reservas/reserva-list/reserva-list.component').then(c => c.ReservaListComponent)
      },
      {
        path: 'hospedes',
        // Isto faz com que o componente só seja carregado quando o utilizador aceder a esta rota
        loadComponent: () => import('./features/hospedes/hospede-list/hospede-list.component').then(c => c.HospedeListComponent)
      },
      // ------------------------------------

      // Se o utilizador aceder à raiz (ex: /), redireciona para o dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Se nenhuma rota corresponder, volta para o login
  { path: '**', redirectTo: 'login' }
];