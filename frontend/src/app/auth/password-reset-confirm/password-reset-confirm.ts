import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-password-reset-confirm',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset-confirm.html',
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
export class PasswordResetConfirm implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup;
  
  message: string | null = null;
  error: string | null = null;
  loading: boolean = false;
  
  uid: string | null = null;
  token: string | null = null;

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.token = this.route.snapshot.paramMap.get('token');

    if (!this.uid || !this.token) {
      this.error = "Lien de réinitialisation invalide ou manquant.";
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password2')?.value
      ? null : { 'mismatch': true };
  }

  confirmReset(): void {
    if (this.resetForm.invalid || !this.uid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.message = null;

    const resetData = {
      ...this.resetForm.value,
      uid: this.uid,
      token: this.token
    };

    this.authService.confirmPasswordReset(resetData).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.';
        this.resetForm.reset();
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Le lien de réinitialisation est invalide ou a expiré.';
        console.error(err);
      }
    });
  }
}
