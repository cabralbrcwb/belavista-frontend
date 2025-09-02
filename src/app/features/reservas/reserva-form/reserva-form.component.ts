import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, startWith, map } from 'rxjs';
import { Reserva, StatusReserva } from '../reserva.service';
import { HospedeService, Hospede } from '../../hospedes/hospede.service';
import { InfoDialogComponent } from '../../../shared/dialogs/info-dialog/info-dialog.component';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatCheckboxModule
  ],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.scss'
})
export class ReservaFormComponent {
  private fb = inject(FormBuilder);
  private hospedeService = inject(HospedeService);
  public dialogRef = inject(MatDialogRef<ReservaFormComponent>);
  private dialog = inject(MatDialog);

  reservaForm: FormGroup;
  isEdit: boolean = false;
  hospedes: Hospede[] = [];
  filteredHospedes: Observable<Hospede[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { reserva?: Reserva }) {
    this.isEdit = !!data?.reserva;
    
    this.reservaForm = this.fb.group({
      hospede: [this.isEdit ? data.reserva?.hospede : null, Validators.required], // Mudança para objeto Hospede completo
      dataEntrada: [data?.reserva?.dataEntrada || '', Validators.required],
      dataSaidaPrevista: [data?.reserva?.dataSaidaPrevista || '', Validators.required],
      adicionalVeiculo: [data?.reserva?.adicionalVeiculo || false], // Campo obrigatório para estacionamento
      observacoes: [data?.reserva?.observacoes || '']
    });

    // Carregar hóspedes para o autocomplete
    this.hospedeService.getHospedes().subscribe(hospedes => {
      this.hospedes = hospedes;
    });

    // Filtrar hóspedes conforme digitação
    this.filteredHospedes = this.reservaForm.get('hospede')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterHospedes(value))
    );
  }

  private _filterHospedes(value: string | Hospede | null): Hospede[] {
    if (value === null || value === undefined) {
      return this.hospedes;
    }
    
    // Se é um objeto Hospede (quando selecionado)
    if (typeof value === 'object' && value.nome) {
      // Quando um hospede é selecionado, não filtra lista (mantém todos)
      return this.hospedes;
    }
    
    // Se é string (digitação do usuário)
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.hospedes.filter(hospede => 
        hospede.nome.toLowerCase().includes(filterValue) ||
        hospede.documento.toLowerCase().includes(filterValue)
      );
    }
    
    return this.hospedes;
  }

  // Função displayWith para o autocomplete
  displayHospede(hospede: Hospede): string {
    return hospede ? `${hospede.nome} (${hospede.documento})` : '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.reservaForm.valid) {
      const formValue = this.reservaForm.value;

      const payload: any = {
        dataEntrada: formValue.dataEntrada,
        dataSaidaPrevista: formValue.dataSaidaPrevista,
        adicionalVeiculo: formValue.adicionalVeiculo, // Campo obrigatório
        observacoes: formValue.observacoes,
        idHospede: formValue.hospede ? formValue.hospede.id : null
      };

      if (!payload.idHospede) {
        console.error('ID do Hóspede está nulo. Verifique o objeto:', formValue.hospede);
        this.dialog.open(InfoDialogComponent, { data: { title: 'Erro', message: 'Hóspede inválido ou não selecionado.' } });
        return;
      }

      if (this.isEdit && this.data.reserva) {
        payload.id = this.data.reserva.id;
      }

      console.log('Payload final para o backend:', payload);
      this.dialogRef.close(payload);
    } else {
      console.log('Formulário inválido:', this.reservaForm.errors);
      this.reservaForm.markAllAsTouched();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.reservaForm.get(fieldName);
    if (field?.hasError('required')) {
      switch(fieldName) {
        case 'hospede':
          return 'Hóspede é obrigatório';
        case 'dataEntrada':
          return 'Data de entrada é obrigatória';
        case 'dataSaidaPrevista':
          return 'Data de saída é obrigatória';
        default:
          return `${fieldName} é obrigatório`;
      }
    }
    return '';
  }
}
