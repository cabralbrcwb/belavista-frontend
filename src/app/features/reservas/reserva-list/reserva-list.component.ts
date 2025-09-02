import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReservaService, Reserva, StatusReserva, CheckoutResponseDTO } from '../reserva.service';
import { ReservaFormComponent } from '../reserva-form/reserva-form.component';
import { NotificationService } from '../../../core/services/notification.service';

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from '../../../shared/dialogs/info-dialog/info-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-reserva-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reserva-list.component.html',
  styleUrl: './reserva-list.component.scss'
})
export class ReservaListComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  public reservas$!: Observable<Reserva[]>;
  public searchForm: FormGroup;
  public StatusReserva = StatusReserva;

  constructor() {
    this.searchForm = this.formBuilder.group({
      status: [''],
      hospedeNome: [''],
      dataEntrada: [''],
      dataSaidaPrevista: ['']
    });
  }

  ngOnInit(): void {
    this.buscarReservas();
  }

  buscarReservas(): void {
    const filters = this.searchForm.value;
    this.reservas$ = this.reservaService.getReservas(filters);
  }

  abrirFormularioNovaReserva(): void {
    const dialogRef = this.dialog.open(ReservaFormComponent, {
      width: '900px', // Aumentada para acomodar calendários
      maxWidth: '95vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservaService.createReserva(result).subscribe({
          next: () => {
            this.buscarReservas();
            this.notificationService.showSuccess('Reserva criada com sucesso!');
          },
          error: (error) => {
            // O erro já será tratado pelo interceptor, mas podemos logar para debug
            console.error('Erro ao criar reserva:', error);
          }
        });
      }
    });
  }

  editarReserva(reserva: Reserva): void {
    const dialogRef = this.dialog.open(ReservaFormComponent, {
      width: '900px', // Aumentada para acomodar calendários
      maxWidth: '95vw',
      data: { reserva }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservaService.updateReserva(result).subscribe({
          next: () => {
            this.buscarReservas();
            this.notificationService.showSuccess('Reserva atualizada com sucesso!');
          },
          error: (error) => {
            // O erro já será tratado pelo interceptor, mas podemos logar para debug
            console.error('Erro ao atualizar reserva:', error);
          }
        });
      }
    });
  }

  excluirReserva(reserva: Reserva): void {
    const nomeHospede = reserva.hospede?.nome || reserva.hospedeNome || 'N/A';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Tem certeza que deseja excluir a reserva do hóspede "${nomeHospede}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.reservaService.deleteReserva(reserva.id!).subscribe({
          next: () => {
            this.buscarReservas();
            this.notificationService.showSuccess('Reserva excluída com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao excluir reserva:', error);
          }
        });
      }
    });
  }

  realizarCheckIn(reserva: Reserva): void {
    const nomeHospede = reserva.hospede?.nome || reserva.hospedeNome || 'N/A';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Confirmar check-in para o hóspede "${nomeHospede}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.reservaService.checkIn(reserva.id!).subscribe({
          next: () => {
            this.buscarReservas();
            this.notificationService.showSuccess('Check-in realizado com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao realizar check-in:', error);
          }
        });
      }
    });
  }

  realizarCheckOut(reserva: Reserva): void {
    const nomeHospede = reserva.hospede?.nome || reserva.hospedeNome || 'N/A';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Confirmar check-out para o hóspede "${nomeHospede}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.reservaService.checkOut(reserva.id!).subscribe({
          next: (response: CheckoutResponseDTO) => {
            this.buscarReservas();
            this.mostrarFatura(response);
            this.notificationService.showSuccess('Check-out realizado com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao realizar check-out:', error);
          }
        });
      }
    });
  }

  mostrarFatura(fatura: CheckoutResponseDTO): void {
    let detalhesText = 'DETALHES DA FATURA:\n\n';
    if (fatura.dataCheckout) {
      const data = new Date(fatura.dataCheckout);
      detalhesText += `Data do Check-out: ${data.toLocaleDateString()} ${data.toLocaleTimeString()}\n\n`;
    }
    
    // Adicionar detalhes de cada custo
    if (fatura.detalhes && fatura.detalhes.length > 0) {
      detalhesText += 'DETALHAMENTO:\n';
      fatura.detalhes.forEach(detalhe => {
        detalhesText += `${detalhe.descricao} (${detalhe.data}): R$ ${detalhe.valor.toFixed(2)}\n`;
      });
      detalhesText += '\n';
    }
    
    // Resumo dos valores
    detalhesText += 'RESUMO:\n';
    detalhesText += `Diárias: R$ ${fatura.valorTotalDiarias.toFixed(2)}\n`;
    detalhesText += `Estacionamento: R$ ${fatura.valorTotalEstacionamento.toFixed(2)}\n`;
    if (fatura.valorMultaAtraso > 0) {
      detalhesText += `Multa por atraso: R$ ${fatura.valorMultaAtraso.toFixed(2)}\n`;
    }
    detalhesText += `\nTOTAL GERAL: R$ ${fatura.valorTotalGeral.toFixed(2)}`;
    
    this.dialog.open(InfoDialogComponent, {
      data: { title: 'Fatura do Check-out', message: detalhesText }
    });
  }

  getStatusColor(status: StatusReserva): string {
    switch (status) {
      case StatusReserva.PENDENTE:
        return 'warn';
      case StatusReserva.CONFIRMADA:
        return 'primary';
      case StatusReserva.CHECK_IN:
        return 'accent';
      case StatusReserva.CHECK_OUT:
        return '';
      case StatusReserva.CANCELADA:
        return '';
      default:
        return '';
    }
  }

  canCheckIn(reserva: Reserva): boolean {
    return reserva.status === StatusReserva.PENDENTE || reserva.status === StatusReserva.CONFIRMADA;
  }

  canCheckOut(reserva: Reserva): boolean {
    return reserva.status === StatusReserva.CHECK_IN;
  }
}
