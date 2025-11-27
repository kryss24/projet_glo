import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  protected readonly title = signal('orientation-app');
  currentYear: number = new Date().getFullYear();
  isAuthenticated: boolean = false;
  userFirstName: string = '';
  mobileMenuOpen: boolean = false;

  ngOnInit(): void {
    // S'abonner aux changements d'état d'authentification
    this.authService.isAuthenticatedSubject.subscribe({
      next: (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadUserName();
        }
      }
    });
  }

  loadUserName(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.userFirstName = user.first_name || user.username;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
      }
    });
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/']);
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}