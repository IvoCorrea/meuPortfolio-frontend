import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/Auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  protected email: string = '';
  protected userName: string = '';
  protected password: string = '';
  protected confirmPassword: string = '';
  protected success: string = '';

  protected error: string = '';
  protected isLoading: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister(): void {
  if (!this.email || !this.userName) {
    this.error = "Email e usuario são obrigatórios";
    return;
  }
  if (!this.password) {
    this.error = "Senha é obrigatório";
    return;
  }
  if (!this.confirmPassword) {
    this.error = "Confirmação de senha é obrigatório";
    return;
  }
  if (this.password !== this.confirmPassword) {
    this.error = "As senhas não coincidem";
    return;
  }

  this.error = '';
  this.isLoading = true;

  this.authService.register(this.email, this.userName, this.password).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.success = 'Conta criada com sucesso! Redirecionando...';
  
  setTimeout(() => {
    this.router.navigate(['/dashboard']);
  }, 2000);

    },
    error: (error) => {
      this.error = error?.error?.message || 'Erro ao registrar';
      }
    });
  }
}

