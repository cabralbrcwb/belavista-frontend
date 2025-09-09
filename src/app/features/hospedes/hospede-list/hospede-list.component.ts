import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { HospedeService, Hospede, TipoDocumento } from '../hospede.service';
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
  public tiposDocumento: TipoDocumento[] = ['RG','CPF','PASSAPORTE','CNH'];

  constructor() {
    // Inicializa o formulário de busca
    this.searchForm = this.formBuilder.group({
      nome: [''],
      tipoDocumento: [''],
      documento: [''],
      telefone: ['']
    });
  }

  ngOnInit(): void {
    this.hospedes$ = this.hospedeService.getHospedes();
    const tel = this.searchForm.get('telefone');
    tel!.valueChanges.subscribe((v: string) => {
      const masked = this.formatPhone(v || '');
      if (v !== masked) tel!.setValue(masked, { emitEvent: false });
    });

    const tipo = this.searchForm.get('tipoDocumento');
    const doc = this.searchForm.get('documento');
    tipo!.valueChanges.subscribe(() => {
      const masked = this.maskDocumento(tipo!.value as TipoDocumento, doc!.value || '');
      doc!.setValue(masked, { emitEvent: false });
    });
    doc!.valueChanges.subscribe((v: string) => {
      const masked = this.maskDocumento(tipo!.value as TipoDocumento, v || '');
      if (v !== masked) doc!.setValue(masked, { emitEvent: false });
    });
  }

  buscarHospedes(): void {
  const filters = this.searchForm.value as { nome?: string; tipoDocumento?: TipoDocumento; documento?: string; telefone?: string };
    const telefoneDigits = (filters.telefone || '').replace(/\D/g, '');
    this.hospedes$ = this.hospedeService.getHospedes({
      ...filters,
      telefone: telefoneDigits || undefined
    });
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

  formatPhoneForDisplay(value?: string | null): string {
    if (!value) return '';
    const digits = ('' + value).replace(/\D/g, '');
    return this.formatPhone(digits);
  }

  formatDocumentoForDisplay(tipo: TipoDocumento, value?: string | null): string {
    if (!value) return '';
    const masked = this.maskDocumento(tipo, value);
    return `${tipo} ${masked}`.trim();
  }

  private formatPhone(value: string): string {
    let digits = (value || '').replace(/\D/g, '').slice(0, 11);
    const ddd = digits.slice(0, 2);
    const numero = digits.slice(2);
    let out = '';
    if (ddd.length) {
      out += `(${ddd}`;
      if (ddd.length === 2) out += ')';
    }
    if (numero.length) {
      out += ddd.length ? ' ' : '';
      const p1 = numero.slice(0, 5);
      const p2 = numero.slice(5, 9);
      out += p1;
      if (p2.length) out += '-' + p2;
    }
    return out;
  }

  private maskDocumento(tipo: TipoDocumento, raw: string): string {
    const v = (raw || '').toString();
    switch (tipo) {
      case 'CPF': {
        const d = v.replace(/\D/g, '').slice(0, 11);
        const p1 = d.slice(0, 3), p2 = d.slice(3, 6), p3 = d.slice(6, 9), p4 = d.slice(9, 11);
        let out = p1;
        if (p2) out += '.' + p2;
        if (p3) out += '.' + p3;
        if (p4) out += '-' + p4;
        return out;
      }
      case 'RG': {
        const d = v.replace(/\D/g, '').slice(0, 9);
        const p1 = d.slice(0, 2), p2 = d.slice(2, 5), p3 = d.slice(5, 8), p4 = d.slice(8, 9);
        let out = p1;
        if (p2) out += '.' + p2;
        if (p3) out += '.' + p3;
        if (p4) out += '-' + p4;
        return out;
      }
      case 'CNH': {
        const d = v.replace(/\D/g, '').slice(0, 11);
        const p1 = d.slice(0, 3), p2 = d.slice(3, 6), p3 = d.slice(6, 9), p4 = d.slice(9, 11);
        let out = p1;
        if (p2) out += '.' + p2;
        if (p3) out += '.' + p3;
        if (p4) out += '-' + p4;
        return out;
      }
      case 'PASSAPORTE': {
        const a = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 9);
        return a.replace(/(.{3})/g, '$1 ').trim();
      }
      default:
        return v;
    }
  }
}
