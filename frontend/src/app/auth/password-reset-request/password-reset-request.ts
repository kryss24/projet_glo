import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-password-reset-request',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset-request.html',
  styles: `
    /* Re-using the same styles as the login form */
    .auth-container {
      max-width: 400px;
      margin: 3rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .auth-title {
      text-align: center;
      color: var(--color-primary);
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      box-sizing: border-box;
    }
    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    .message {
      text-align: center;
      margin-top: 1rem;
    }
    .error-message {
      color: var(--color-accent);
      text-align: center;
      margin-bottom: 1rem;
    }
  `
})
export class PasswordResetRequest {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  message: string | null = null;
  error: string | null = null;
  loading: boolean = false;

  requestReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.message = null;

    this.authService.requestPasswordReset(this.resetForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.';
        this.resetForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
      }
    });
  }
}
