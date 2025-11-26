import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { CatalogService, Field, PaginatedResponse, Favorite } from '../catalog.service';
import { AuthService } from '../../auth/auth.service';
import { HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router'; // Import Router

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, RouterLink],
  templateUrl: './field-list.html',
  styles: `
    .field-list-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .filter-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .field-card {
      background-color: #fff;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      position: relative; /* For favorite button positioning */
    }
    .field-card h3 {
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    .field-card p {
      margin-bottom: 0.5rem;
    }
    .search-input, .filter-select {
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 1rem;
    }
    .pagination {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .pagination button {
      background-color: var(--color-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .pagination button:disabled {
      background-color: var(--gray-400);
      cursor: not-allowed;
    }
    .favorite-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #ccc; /* Default color */
    }
    .favorite-button.favorited {
      color: var(--color-accent); /* Red for favorited */
    }
  `,
})
export class FieldList implements OnInit {
  private catalogService = inject(CatalogService);
  public authService = inject(AuthService);
  private router = inject(Router);
  
  fields: Field[] = [];
  favorites: Favorite[] = []; // Store user's favorites
  loading: boolean = true;
  error: string | null = null;
  
  searchControl = new FormControl('');
  durationFilterControl = new FormControl('');

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadFields();
    });

    this.durationFilterControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadFields();
    });

    this.loadFields();
  }

  loadFields(): void {
    this.loading = true;
    this.error = null;

    let params = new HttpParams();
    if (this.searchControl.value) {
      params = params.set('search', this.searchControl.value);
    }
    if (this.durationFilterControl.value) {
      params = params.set('duration_years', this.durationFilterControl.value);
    }
    params = params.set('page', this.currentPage.toString());
    params = params.set('page_size', this.pageSize.toString());

    // Fetch fields first
    this.catalogService.getFields(params).subscribe({
      next: (response: PaginatedResponse<Field>) => {
        this.fields = response.results;
        this.totalItems = response.count;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
        // Then, if authenticated, fetch favorites to update status
        if (this.authService.isAuthenticatedSubject.value) {
          this.loadFavorites();
        }
      },
      error: (err) => {
        this.error = 'Failed to load academic fields.';
        this.loading = false;
        console.error(err);
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
    this.fields = this.fields.map(field => {
      const favorited = this.favorites.find(fav => fav.field === field.id);
      return {
        ...field,
        isFavorited: !!favorited,
        favoriteId: favorited ? favorited.id : undefined
      };
    });
  }

  isFieldFavorited(fieldId: number): boolean {
    return this.favorites.some(fav => fav.field === fieldId);
  }

  toggleFavorite(field: Field): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour ajouter des filières aux favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (field.isFavorited) {
      // Remove from favorites
      if (field.favoriteId) {
        this.catalogService.removeFavorite(field.favoriteId).subscribe({
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
      this.catalogService.addFavorite(field.id).subscribe({
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFields();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFields();
    }
  }
}
