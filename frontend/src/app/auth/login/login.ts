import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: `
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
      box-sizing: border-box; /* Important for width */
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
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  error: string | null = null;
  loading: boolean = false;

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        alert('Connexion réussie !');
        this.router.navigate(['/student']); // Redirect to student dashboard
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Échec de la connexion. Veuillez vérifier vos identifiants.';
        console.error(err);
      }
    });
  }
}
