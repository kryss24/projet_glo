import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Field, Institution, Favorite, PaginatedResponse } from '../catalog.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './field-detail.html',
  styles: `
    .field-detail-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    .field-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }
    .field-header h2 {
      color: var(--color-primary);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .field-info p {
      margin-bottom: 1rem;
      line-height: 1.8;
    }
    .field-info strong {
      display: inline-block;
      width: 150px;
      font-weight: 600;
    }
    .institution-card {
      background-color: var(--color-background-light);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 0.8rem;
    }
    .institution-card h4 {
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    .error-message {
      color: var(--color-accent);
      text-align: center;
    }
    .favorite-button {
      position: absolute;
      top: 0;
      right: 0;
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #ccc; /* Default color */
    }
    .favorite-button.favorited {
      color: var(--color-accent); /* Red for favorited */
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
  favorites: Favorite[] = []; // User's favorites

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const fieldId = params.get('id');
      if (fieldId) {
        this.loadFieldDetails(Number(fieldId));
      } else {
        this.error = 'Field ID not provided.';
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
        this.error = 'Failed to load field details.';
        this.loading = false;
        console.error(err);
        this.router.navigate(['/catalog']); // Redirect to catalog list on error
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
      // Remove from favorites
      if (this.field.favoriteId) {
        this.catalogService.removeFavorite(this.field.favoriteId).subscribe({
          next: () => {
            alert('Filière retirée des favoris !');
            this.loadFavorites(); // Reload favorites to update UI
          },
          error: (err) => {
            console.error('Erreur lors de la suppression des favoris', err);
            alert('Échec de la suppression des favoris.');
          }
        });
      }
    } else {
      // Add to favorites
      this.catalogService.addFavorite(this.field.id).subscribe({
        next: () => {
          alert('Filière ajoutée aux favoris !');
          this.loadFavorites(); // Reload favorites to update UI
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout aux favoris', err);
          alert('Échec de l\'ajout aux favoris. Peut-être déjà dans vos favoris ?');
        }
      });
    }
  }
}
