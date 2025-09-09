import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Hospede, TipoDocumento } from '../hospede.service';

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
  tiposDocumento: TipoDocumento[] = ['RG','CPF','PASSAPORTE','CNH'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { hospede?: Hospede }) {
    this.isEdit = !!data?.hospede;
    
    this.hospedeForm = this.fb.group({
      nome: [data?.hospede?.nome || '', [Validators.required, Validators.minLength(2)]],
  tipoDocumento: [data?.hospede?.tipoDocumento || '', [Validators.required]],
      documento: [data?.hospede?.documento || '', [Validators.required, Validators.minLength(3)]],
      telefone: [this.formatPhone(data?.hospede?.telefone || ''), [
        Validators.required,
        Validators.pattern(/^\(\d{2}\)\s9\d{4}-\d{4}$/)
      ]],
      email: [data?.hospede?.email || '']
    });

    const telCtrl = this.hospedeForm.get('telefone');
    telCtrl!.valueChanges.subscribe((value: string) => {
      const formatted = this.formatPhone(value || '');
      if (value !== formatted) {
        telCtrl!.setValue(formatted, { emitEvent: false });
      }
    });

    const tipoCtrl = this.hospedeForm.get('tipoDocumento');
    const docCtrl = this.hospedeForm.get('documento');
    // Reaplica máscara ao trocar o tipo
    tipoCtrl!.valueChanges.subscribe(() => {
      const masked = this.maskDocumento(tipoCtrl!.value as TipoDocumento, docCtrl!.value || '');
      docCtrl!.setValue(masked, { emitEvent: false });
    });
    // Mascara o documento conforme o tipo
    docCtrl!.valueChanges.subscribe((value: string) => {
      const masked = this.maskDocumento(tipoCtrl!.value as TipoDocumento, value || '');
      if (value !== masked) {
        docCtrl!.setValue(masked, { emitEvent: false });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.hospedeForm.valid) {
      const form = this.hospedeForm.value as { nome: string; tipoDocumento: TipoDocumento; documento: string; telefone: string; email?: string };
      const telefoneDigits = (form.telefone || '').replace(/\D/g, '');
      const payload: Hospede = {
        nome: form.nome,
        tipoDocumento: form.tipoDocumento,
        documento: form.documento,
        // Envia apenas dígitos para o backend
        telefone: telefoneDigits,
        email: form.email || undefined
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
    if (fieldName === 'telefone' && field?.hasError('pattern')) {
      return 'Telefone inválido. Use o formato (DD) 9XXXX-XXXX';
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      switch(fieldName) {
        case 'nome':
          return `Nome deve ter pelo menos ${requiredLength} caracteres`;
        case 'documento':
          return `Documento deve ter pelo menos ${requiredLength} caracteres`;
        default:
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} deve ter pelo menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  private formatPhone(value: string): string {
    if (!value) return '';
    // Mantém apenas dígitos
    let digits = value.replace(/\D/g, '');
    // Limita a 11 dígitos (2 DDD + 9 número)
    digits = digits.slice(0, 11);
    const ddd = digits.slice(0, 2);
    const numero = digits.slice(2); // até 9 dígitos
    let out = '';
    if (ddd.length) {
      out += `(${ddd}`;
      if (ddd.length === 2) out += ')';
    }
    if (numero.length) {
      out += ddd.length ? ' ' : '';
      const p1 = numero.slice(0, 5); // 9xxxx
      const p2 = numero.slice(5, 9); // xxxx
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
        // Letras e números, até 9, coloca um espaço a cada 3 para legibilidade
        const a = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 9);
        return a.replace(/(.{3})/g, '$1 ').trim();
      }
      default:
        return v;
    }
  }
}
