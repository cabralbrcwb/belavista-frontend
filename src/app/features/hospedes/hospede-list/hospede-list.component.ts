import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { HospedeService, Hospede } from '../hospede.service';
import { HospedeFormComponent } from '../hospede-form/hospede-form.component';
import { NotificationService } from '../../../core/services/notification.service';

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hospede-list',
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
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './hospede-list.component.html',
  styleUrl: './hospede-list.component.scss'
})
export class HospedeListComponent implements OnInit {
  private hospedeService = inject(HospedeService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  public hospedes$!: Observable<Hospede[]>;
  public searchForm: FormGroup;

  constructor() {
    // Inicializa o formulário de busca
    this.searchForm = this.formBuilder.group({
      nome: [''],
      documento: [''],
      telefone: ['']
    });
  }

  ngOnInit(): void {
    this.hospedes$ = this.hospedeService.getHospedes();
  }

  buscarHospedes(): void {
    const filters = this.searchForm.value;
    this.hospedes$ = this.hospedeService.getHospedes(filters);
  }

  abrirFormularioNovoHospede(): void {
    const dialogRef = this.dialog.open(HospedeFormComponent, {
      width: '600px', // Aumentada de 500px para 600px
      maxWidth: '90vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hospedeService.createHospede(result).subscribe({
          next: () => {
            this.buscarHospedes(); // Atualiza a lista
            this.notificationService.showSuccess('Hóspede criado com sucesso!');
          },
          error: (error) => {
            // O erro já será tratado pelo interceptor, mas podemos logar para debug
            console.error('Erro ao criar hóspede:', error);
          }
        });
      }
    });
  }

  editarHospede(hospede: Hospede): void {
    const dialogRef = this.dialog.open(HospedeFormComponent, {
      width: '600px', // Aumentada de 500px para 600px
      maxWidth: '90vw',
      data: { hospede }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hospedeService.updateHospede(result).subscribe({
          next: () => {
            this.buscarHospedes(); // Atualiza a lista
            this.notificationService.showSuccess('Hóspede atualizado com sucesso!');
          },
          error: (error) => {
            // O erro já será tratado pelo interceptor, mas podemos logar para debug
            console.error('Erro ao atualizar hóspede:', error);
          }
        });
      }
    });
  }

  excluirHospede(hospede: Hospede): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Tem certeza que deseja excluir o hóspede "${hospede.nome}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.hospedeService.deleteHospede(hospede.id!).subscribe({
          next: () => {
            this.buscarHospedes(); // Atualiza a lista
            this.notificationService.showSuccess('Hóspede excluído com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao excluir hóspede:', error);
          }
        });
      }
    });
  }
}
