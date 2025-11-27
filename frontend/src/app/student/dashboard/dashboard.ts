import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { OrientationService, OrientationTest as BackendOrientationTest, PaginatedResponse } from '../../orientation/orientation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './dashboard.html',
  styles: `
    .dashboard-container {
      max-width: 1000px;
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
    .dashboard-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .section-card {
      background-color: var(--color-background-light);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .section-card h3 {
      color: var(--color-secondary);
      margin-bottom: 1rem;
    }
    .section-card button, .section-card a {
      background-color: var(--color-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      text-decoration: none;
      margin-top: 1rem;
      display: inline-block;
    }
    .section-card button:hover, .section-card a:hover {
      opacity: 0.9;
    }
    .test-list {
      list-style: none;
      padding: 0;
      width: 100%;
    }
    .test-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      border-bottom: 1px solid #eee;
    }
    .test-list li:last-child {
      border-bottom: none;
    }
    .test-list li a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
    }
    .test-list li a:hover {
      text-decoration: underline;
    }
    .error-message {
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 1rem;
      border-radius: 5px;
      text-align: center;
    }
    .text-center {
      text-align: center;
    }
    .mt-8 {
      margin-top: 2rem;
    }
    .score-section h3 {
      color: var(--color-primary);
      margin-bottom: 1rem;
    }
  `,
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private orientationService = inject(OrientationService);
  private router = inject(Router);

  user: User | null = null;
  latestTest: BackendOrientationTest | null = null;
  pastTests: BackendOrientationTest[] = [];
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour accéder à votre tableau de bord.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.authService.getUserProfile().subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        this.loadStudentData();
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error = 'Impossible de charger votre profil.';
        this.loading = false;
      }
    });
  }

  loadStudentData(): void {
    this.orientationService.getUserTests().subscribe({
      next: (response: PaginatedResponse<BackendOrientationTest> | BackendOrientationTest[]) => {
        console.log('getUserTests response:', response);
        
        // Gérer les deux formats possibles de réponse
        if (Array.isArray(response)) {
          // Si la réponse est directement un tableau
          this.pastTests = response;
        } else if (response && response.results) {
          // Si la réponse est paginée avec un objet contenant 'results'
          this.pastTests = response.results;
        } else {
          // Sinon, initialiser un tableau vide
          console.warn('Unexpected response format:', response);
          this.pastTests = [];
        }
        
        // Trouver le test le plus récent complété
        this.latestTest = this.pastTests.length > 0 ? this.pastTests[0] : null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading past tests:', err);
        this.error = 'Impossible de charger l\'historique de vos tests.';
        this.pastTests = [];
        this.loading = false;
      }
    });
  }

  startNewTest(): void {
    this.router.navigate(['/student/test']);
  }

  viewLatestResult(): void {
    if (this.latestTest && this.latestTest.id) {
      this.router.navigate(['/student/test-result', this.latestTest.id]);
    } else {
      alert('Aucun test complété trouvé.');
    }
  }
}