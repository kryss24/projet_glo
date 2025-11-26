import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { CatalogService, Favorite, PaginatedResponse } from '../../catalog/catalog.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-list.html',
  styles: `
    .favorite-list-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .favorite-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    .favorite-card:last-child {
      border-bottom: none;
    }
    .favorite-card h3 {
      color: var(--color-primary);
      margin: 0;
    }
    .remove-button {
      background-color: var(--color-accent);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .remove-button:hover {
      opacity: 0.9;
    }
  `,
})
export class FavoriteList implements OnInit {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private router = inject(Router);

  favorites: Favorite[] = [];
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour voir vos favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.error = null;
    this.catalogService.getFavorites().subscribe({
      next: (response: PaginatedResponse<Favorite>) => {
        this.favorites = response.results;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load favorites.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  removeFavorite(favoriteId: number): void {
    if (confirm('Êtes-vous sûr de vouloir retirer cette filière de vos favoris ?')) {
      this.catalogService.removeFavorite(favoriteId).subscribe({
        next: () => {
          alert('Filière retirée des favoris !');
          this.loadFavorites(); // Refresh the list
        },
        error: (err) => {
          console.error('Erreur lors de la suppression des favoris', err);
          alert('Échec de la suppression des favoris.');
        }
      });
    }
  }
}
