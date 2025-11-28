import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styles: `
    /* Re-using the same styles as the login form */
    .auth-container {
      max-width: 450px;
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
    .form-group input, .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      box-sizing: border-box;
    }
    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #F5D2B9FF;
      color: black;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .submit-button:hover {
      opacity: 0.9;
      background-color: #f59e0b;
    }
    .auth-links {
      text-align: center;
      margin-top: 1rem;
    }
    .auth-links a {
      color: var(--color-primary);
      text-decoration: none;
    }
    .auth-links a:hover {
      text-decoration: underline;
    }
    .error-message {
      color: var(--color-accent);
      text-align: center;
      margin-bottom: 1rem;
    }
  `
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;

  error: string | null = null;
  loading: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
      role: ['student', [Validators.required]] // Default to 'student'
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password2')?.value
      ? null : { 'mismatch': true };
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        // This relies on the global error interceptor to format the message
        // Or you can do specific formatting here
        this.error = 'Échec de l\'inscription. Veuillez vérifier vos informations.';
        console.error(err);
      }
    });
  }
}
