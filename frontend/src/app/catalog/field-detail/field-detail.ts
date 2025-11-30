import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService, Field, Institution, Favorite, PaginatedResponse } from '../catalog.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './field-detail.html',
  styles: `
    .field-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Back Button */
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      text-decoration: none;
      margin-bottom: 2rem;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .back-button:hover {
      color: #2563eb;
    }

    .back-button::before {
      content: '←';
      font-size: 1.2rem;
    }

    /* Field Header */
    .field-header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      position: relative;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
    }

    .field-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      padding-right: 4rem;
    }

    .field-subtitle {
      font-size: 1.1rem;
      opacity: 0.95;
    }

    .favorite-button {
      position: absolute;
      top: 2rem;
      right: 2rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .favorite-button:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.3);
    }

    .favorite-button:not(.favorited) {
      filter: grayscale(100%);
    }

    .favorite-button.favorited {
      background: rgba(255, 255, 255, 0.9);
      animation: heartBeat 0.3s ease;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(1.05); }
    }

    /* Quick Stats */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
    }

    /* Main Content */
    .content-grid {
      display: grid;
      gap: 2rem;
    }

    .content-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 1.5rem;
      background: #2563eb;
      border-radius: 2px;
    }

    .description-text {
      color: #4b5563;
      line-height: 1.8;
      font-size: 1.05rem;
    }

    /* Info List */
    .info-list {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 3px solid #2563eb;
    }

    .info-label {
      font-weight: 600;
      color: #374151;
      min-width: 150px;
    }

    .info-value {
      color: #4b5563;
      flex: 1;
    }

    /* Tags */
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tag.skill-tag {
      background: #fef3c7;
      color: #92400e;
    }

    .tag.career-tag {
      background: #d1fae5;
      color: #065f46;
    }

    /* Institutions Section */
    .institutions-grid {
      display: grid;
      gap: 1rem;
    }

    .institution-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .institution-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .institution-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .institution-card h4 {
      color: #2563eb;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
    }

    .institution-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .institution-type.public {
      background: #dcfce7;
      color: #166534;
    }

    .institution-type.private {
      background: #e0e7ff;
      color: #3730a3;
    }

    .institution-info {
      display: grid;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .institution-info p {
      margin: 0;
    }

    .institution-description {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      color: #4b5563;
      line-height: 1.6;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      color: #6b7280;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.05rem;
    }

    /* Loading & Error */
    .loading-state,
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .loading-state p {
      color: #6b7280;
      font-size: 1.2rem;
    }

    .error-state {
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 2rem;
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .field-detail-container {
        padding: 1rem;
      }

      .field-header {
        padding: 2rem 1.5rem;
      }

      .field-header h2 {
        font-size: 2rem;
        padding-right: 0;
      }

      .favorite-button {
        position: static;
        margin-top: 1rem;
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
      }

      .quick-stats {
        grid-template-columns: 1fr;
      }

      .content-section {
        padding: 1.5rem;
      }

      .info-item {
        flex-direction: column;
        gap: 0.5rem;
      }

      .info-label {
        min-width: auto;
      }
    }
  `,
})
export class FieldDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  public authService = inject(AuthService);

  field: Field | null = null;
  loading: boolean = true;
  error: string | null = null;
  favorites: Favorite[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const fieldId = params.get('id');
      if (fieldId) {
        this.loadFieldDetails(Number(fieldId));
      } else {
        this.error = 'Identifiant de filière non fourni.';
        this.loading = false;
      }
    });
  }

  loadFieldDetails(id: number): void {
    this.loading = true;
    this.error = null;
    this.catalogService.getField(id).subscribe({
      next: (data) => {
        this.field = data;
        this.loading = false;
        if (this.authService.isAuthenticatedSubject.value) {
          this.loadFavorites();
        }
      },
      error: (err) => {
        this.error = 'Impossible de charger les détails de la filière.';
        this.loading = false;
        console.error(err);
        setTimeout(() => {
          this.router.navigate(['/catalog']);
        }, 2000);
      }
    });
  }

  loadFavorites(): void {
    this.catalogService.getFavorites().subscribe({
      next: (response: PaginatedResponse<Favorite>) => {
        this.favorites = response.results;
        this.updateFieldFavoritedStatus();
      },
      error: (err) => {
        console.error('Failed to load favorites:', err);
      }
    });
  }

  updateFieldFavoritedStatus(): void {
    if (this.field) {
      const favorited = this.favorites.find(fav => fav.field === this.field?.id);
      this.field = {
        ...this.field,
        isFavorited: !!favorited,
        favoriteId: favorited ? favorited.id : undefined
      };
    }
  }

  toggleFavorite(): void {
    if (!this.authService.isAuthenticatedSubject.value || !this.field) {
      alert('Veuillez vous connecter pour gérer les favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.field.isFavorited) {
      if (this.field.favoriteId) {
        this.catalogService.removeFavorite(this.field.favoriteId).subscribe({
          next: () => {
            this.loadFavorites();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression des favoris', err);
            alert('Échec de la suppression des favoris.');
          }
        });
      }
    } else {
      this.catalogService.addFavorite(this.field.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout aux favoris', err);
          alert('Échec de l\'ajout aux favoris.');
        }
      });
    }
  }
}