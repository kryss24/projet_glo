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
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .dashboard-header h2 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dashboard-header p {
      font-size: 1.1rem;
      opacity: 0.95;
      margin: 0;
    }

    .loading-container, .error-container {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .loading-spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      color: #dc3545;
      background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
      border: 2px solid #ffccd5;
      padding: 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .error-message::before {
      content: "⚠️";
      font-size: 1.5rem;
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .section-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
      position: relative;
      overflow: hidden;
    }

    .section-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .section-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
    }

    .section-card:hover::before {
      transform: scaleX(1);
    }

    .section-card h3 {
      color: #2d3748;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-card h3::before {
      font-size: 1.8rem;
    }

    .section-card:nth-child(1) h3::before { content: "📊"; }
    .section-card:nth-child(2) h3::before { content: "👤"; }
    .section-card:nth-child(3) h3::before { content: "⭐"; }

    .section-card p {
      color: #718096;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .section-card .test-info {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #4a5568;
      font-weight: 500;
    }

    .section-card .test-info.in-progress {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #fbbf24;
      color: #92400e;
    }

    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      margin: 0.5rem 0.5rem 0 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
    }

    .btn-secondary:hover {
      box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }

    .btn-warning:hover {
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }



    .history-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
    }

    .history-section h3 {
      color: #2d3748;
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .history-section h3::before {
      content: "📚";
      font-size: 2rem;
    }

    .test-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .test-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s ease;
    }

    .test-list li:hover {
      background-color: #f7fafc;
    }

    .test-list li:last-child {
      border-bottom: none;
    }

    .test-list li span {
      color: #4a5568;
      font-weight: 500;
    }

    .test-list li a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .test-list li a:hover {
      background-color: #667eea;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .empty-state::before {
      content: "📋";
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header h2 {
        font-size: 1.75rem;
      }

      .dashboard-sections {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .test-list li {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .test-list li a {
        align-self: stretch;
        text-align: center;
      }
    }
  `,
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private orientationService = inject(OrientationService);
  private router = inject(Router);

  user: User | null = null;
  latestTest: BackendOrientationTest | null = null;
  activeTest: BackendOrientationTest | null = null; // Test en cours
  completedTests: BackendOrientationTest[] = []; // Tests complétés
  pastTests: BackendOrientationTest[] = []; // Tous les tests
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
          this.pastTests = response;
        } else if (response && response.results) {
          this.pastTests = response.results;
        } else {
          console.warn('Unexpected response format:', response);
          this.pastTests = [];
        }
        
        // Séparer les tests actifs et complétés
        this.activeTest = this.pastTests.find(test => !test.is_completed) || null;
        this.completedTests = this.pastTests.filter(test => test.is_completed);
        this.latestTest = this.completedTests.length > 0 ? this.completedTests[0] : null;
        
        console.log('Active test:', this.activeTest);
        console.log('Completed tests:', this.completedTests);
        console.log('Latest test:', this.latestTest);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading past tests:', err);
        this.error = 'Impossible de charger l\'historique de vos tests.';
        this.pastTests = [];
        this.activeTest = null;
        this.completedTests = [];
        this.latestTest = null;
        this.loading = false;
      }
    });
  }

  startNewTest(): void {
    // Naviguer vers la page de test
    // La page de test vérifiera automatiquement s'il existe un test actif
    this.router.navigate(['/student/test']);
  }

  continueTest(): void {
    if (this.activeTest && this.activeTest.id) {
      this.router.navigate(['/student/test'], { 
        queryParams: { testId: this.activeTest.id } 
      });
    } else {
      alert('Aucun test actif trouvé.');
    }
  }

  viewLatestResult(): void {
    if (this.latestTest && this.latestTest.id) {
      this.router.navigate(['/student/test-result', this.latestTest.id]);
    } else {
      alert('Aucun test complété trouvé.');
    }
  }
}