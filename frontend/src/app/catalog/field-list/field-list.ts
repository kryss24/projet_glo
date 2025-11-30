import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import {
  CatalogService,
  Field,
  PaginatedResponse,
  Favorite,
} from '../catalog.service';
import { AuthService } from '../../auth/auth.service';
import { HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin, of } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, RouterLink],
  templateUrl: './field-list.html',
  styles: [
    `
      .field-list-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .page-header h2 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .page-header p {
        font-size: 1.1rem;
        color: #6b7280;
      }

      /* Filter Section */
      .filter-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
      }

      .search-input,
      .filter-select {
        flex: 1;
        min-width: 200px;
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: white;
      }

      .search-input:focus,
      .filter-select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .search-input::placeholder {
        color: #9ca3af;
      }

      /* Results Info */
      .results-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 0 0.5rem;
      }

      .results-count {
        font-size: 0.95rem;
        color: #6b7280;
      }

      .results-count strong {
        color: #1f2937;
        font-weight: 600;
      }

      /* Field Cards */
      .fields-grid {
        display: grid;
        gap: 1.5rem;
      }

      .field-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .field-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .favorite-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        transition: transform 0.2s ease;
        padding: 0.25rem;
        line-height: 1;
      }

      .favorite-button:hover {
        transform: scale(1.2);
      }

      .favorite-button:not(.favorited) {
        filter: grayscale(100%);
        opacity: 0.5;
      }

      .favorite-button.favorited {
        animation: heartBeat 0.3s ease;
      }

      @keyframes heartBeat {
        0%,
        100% {
          transform: scale(1);
        }
        25% {
          transform: scale(1.3);
        }
        50% {
          transform: scale(1.1);
        }
      }

      .field-card h3 {
        color: #2563eb;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        padding-right: 3rem;
      }

      .field-card h3:hover {
        text-decoration: underline;
      }

      .field-description {
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .field-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #6b7280;
      }

      .meta-item strong {
        color: #374151;
        font-weight: 600;
      }

      .meta-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
      }

      .field-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .tag {
        background: #f3f4f6;
        color: #4b5563;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
      }

      .view-details-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #2563eb;
        font-weight: 600;
        text-decoration: none;
        margin-top: 1rem;
        transition: color 0.3s ease;
      }

      .view-details-link:hover {
        color: #1e40af;
      }

      .view-details-link::after {
        content: '→';
        transition: transform 0.3s ease;
      }

      .view-details-link:hover::after {
        transform: translateX(4px);
      }

      /* Pagination */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
      }

      .pagination button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .pagination button:hover:not(:disabled) {
        background: #1e40af;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
      }

      .pagination button:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }

      .pagination span {
        font-weight: 500;
        color: #4b5563;
        min-width: 120px;
        text-align: center;
      }

      /* Loading & Error States */
      .loading-state,
      .error-state,
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
      }

      .loading-state p {
        color: #6b7280;
        font-size: 1.1rem;
      }

      .error-state {
        color: #dc2626;
        background: #fee2e2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 2rem;
      }

      .empty-state {
        background: #f9fafb;
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        padding: 3rem;
      }

      .empty-state p {
        color: #6b7280;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .field-list-container {
          padding: 1rem;
        }

        .page-header h2 {
          font-size: 2rem;
        }

        .filter-section {
          flex-direction: column;
        }

        .search-input,
        .filter-select {
          width: 100%;
        }

        .results-info {
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .field-meta {
          flex-direction: column;
          gap: 0.5rem;
        }

        .pagination {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class FieldList implements OnInit {
  private catalogService = inject(CatalogService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  fields: Field[] = [];
  favorites: Favorite[] = [];
  loading: boolean = true;
  error: string | null = null;

  searchControl = new FormControl('');
  durationFilterControl = new FormControl('');

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
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

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('page_size', this.pageSize.toString());

    if (this.searchControl.value) {
      params = params.set('search', this.searchControl.value);
    }
    if (this.durationFilterControl.value) {
      params = params.set('duration_years', this.durationFilterControl.value);
    }

    const fields$ = this.catalogService.getFields(params);
    const favorites$ = this.authService.isAuthenticatedSubject.value
      ? this.catalogService.getFavorites().pipe(
          catchError(() => {
            console.error('Failed to load favorites, continuing without them.');
            return of({ count: 0, next: null, previous: null, results: [] });
          })
        )
      : of({ count: 0, next: null, previous: null, results: [] });

    forkJoin([fields$, favorites$]).subscribe({
      next: ([fieldsResponse, favoritesResponse]) => {
        this.totalItems = fieldsResponse.count;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        const favorites = favoritesResponse.results;

        this.fields = fieldsResponse.results.map((field) => {
          const favorited = favorites.find((fav) => fav.field === field.id);
          return {
            ...field,
            isFavorited: !!favorited,
            favoriteId: favorited ? favorited.id : undefined,
          };
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Impossible de charger les filières académiques.';
        this.loading = false;
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  toggleFavorite(field: Field): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour ajouter des filières aux favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const action$ = field.isFavorited
      ? this.catalogService.removeFavorite(field.favoriteId!)
      : this.catalogService.addFavorite(field.id);

    action$.subscribe({
      next: () => {
        this.loadFields();
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour des favoris", err);
        alert('Échec de la mise à jour des favoris.');
        this.loadFields();
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFields();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFields();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}