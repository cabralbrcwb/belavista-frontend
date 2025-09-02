import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Importe o seu serviço de autenticação
import { AuthService, LoginCredentials } from '../../core/services/auth.service';

// Imports do Angular Material (AQUI ESTÁ A CORREÇÃO!)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Injeção de dependências
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variáveis para controlar a UI
  isLoading = false;
  errorMessage: string | null = null;
  hidePassword = true;

  // Criação do formulário com validações
  loginForm = this.fb.group({
    login: ['atendente', [Validators.required]], // Valor inicial para facilitar o teste
    senha: ['123456', [Validators.required]]    // Valor inicial para facilitar o teste
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.getRawValue() as LoginCredentials;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard'); // Redireciona para o dashboard em caso de sucesso
      },
      error: (err: any) => {
        this.errorMessage = 'Login ou senha inválidos. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
}