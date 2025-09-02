import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Hospede } from '../hospede.service';

@Component({
  selector: 'app-hospede-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './hospede-form.component.html',
  styleUrl: './hospede-form.component.scss'
})
export class HospedeFormComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<HospedeFormComponent>);

  hospedeForm: FormGroup;
  isEdit: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { hospede?: Hospede }) {
    this.isEdit = !!data?.hospede;
    
    this.hospedeForm = this.fb.group({
      nome: [data?.hospede?.nome || '', [Validators.required, Validators.minLength(2)]],
      documento: [data?.hospede?.documento || '', [Validators.required, Validators.minLength(3)]],
      telefone: [data?.hospede?.telefone || '', [Validators.required, Validators.minLength(8)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.hospedeForm.valid) {
      const form = this.hospedeForm.value as { nome: string; documento: string; telefone: string };
      const payload: Hospede = {
        nome: form.nome,
        documento: form.documento,
        telefone: form.telefone
      };
      if (this.isEdit && this.data.hospede) {
        payload.id = this.data.hospede.id;
      }
      this.dialogRef.close(payload);
    } else {
      // Marca todos os campos como touched para mostrar os erros
      this.hospedeForm.markAllAsTouched();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.hospedeForm.get(fieldName);
    if (field?.hasError('required')) {
      switch(fieldName) {
        case 'nome':
          return 'Nome é obrigatório';
        case 'documento':
          return 'Documento é obrigatório';
        case 'telefone':
          return 'Telefone é obrigatório';
        default:
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} é obrigatório`;
      }
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      switch(fieldName) {
        case 'nome':
          return `Nome deve ter pelo menos ${requiredLength} caracteres`;
        case 'documento':
          return `Documento deve ter pelo menos ${requiredLength} caracteres`;
        case 'telefone':
          return `Telefone deve ter pelo menos ${requiredLength} caracteres`;
        default:
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} deve ter pelo menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }
}
