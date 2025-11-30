import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { switchMap, of, throwError, timeout, catchError } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink],
  templateUrl: './dashboard.html',
  styles: [
    `
      .admin-dashboard-container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .dashboard-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      .dashboard-header h2 {
        color: var(--color-primary);
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      .stat-card {
        background-color: var(--color-background-light);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
      }
      .stat-card h3 {
        color: var(--color-secondary);
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      .stat-card p {
        font-size: 2rem;
        font-weight: bold;
        color: var(--color-primary);
      }
      .management-links {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .management-links a {
        background-color: var(--color-primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        text-decoration: none;
        transition: background-color 0.3s ease;
      }
      .management-links a:hover {
        background-color: var(--color-secondary);
      }
    `,
  ],
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  stats: AdminStats | null = null;
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loading = true;
    this.authService.isAuthenticated$.pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          alert('Veuillez vous connecter en tant qu\'administrateur.');
          this.router.navigate(['/auth/login']);
          return of(null);
        }
        
        // Assuming authService.user is populated after authentication
        if (this.authService.user?.role !== 'admin') {
          alert('Accès refusé. Vous n\'êtes pas un administrateur.');
          this.router.navigate(['/']);
          return of(null);
        }
        
        return this.adminService.getAdminStats().pipe(
          timeout(15000),
          catchError(err => {
            console.error(err);
            // Re-throw a more user-friendly error
            return throwError(() => new Error('Failed to load admin statistics.'));
          })
        );
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.stats = data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
