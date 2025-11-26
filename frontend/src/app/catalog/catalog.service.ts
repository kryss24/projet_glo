import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from '../config';

export interface Institution {
  id: number;
  name: string;
  city: string;
  type: 'public' | 'private';
  logo?: string;
  description?: string;
}

export interface Field {
  id: number;
  name: string;
  description: string;
  duration_years: number;
  career_opportunities: string[];
  required_skills: string[];
  institutions: Institution[]; // Nested institutions
  admission_criteria?: string;
  tuition_fees_min?: number;
  tuition_fees_max?: number;
  isFavorited?: boolean; // Added for frontend state management
  favoriteId?: number; // Added to store the favorite entry ID if favorited
}

export interface Favorite {
  id?: number;
  user?: number; // User ID
  field: number; // Field ID
  field_name?: string;
  added_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `${BACKEND_API_URL}/catalog/`;

  constructor() { }

  // --- Institutions ---
  getInstitutions(params?: HttpParams): Observable<PaginatedResponse<Institution>> {
    return this.http.get<PaginatedResponse<Institution>>(`${this.API_BASE_URL}institutions/`, { params });
  }

  getInstitution(id: number): Observable<Institution> {
    return this.http.get<Institution>(`${this.API_BASE_URL}institutions/${id}/`);
  }

  // --- Fields ---
  getFields(params?: HttpParams): Observable<PaginatedResponse<Field>> {
    return this.http.get<PaginatedResponse<Field>>(`${this.API_BASE_URL}fields/`, { params });
  }

  getField(id: number): Observable<Field> {
    return this.http.get<Field>(`${this.API_BASE_URL}fields/${id}/`);
  }

  // --- Favorites ---
  getFavorites(params?: HttpParams): Observable<PaginatedResponse<Favorite>> {
    return this.http.get<PaginatedResponse<Favorite>>(`${this.API_BASE_URL}favorites/`, { params });
  }

  addFavorite(fieldId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.API_BASE_URL}favorites/`, { field: fieldId });
  }

  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}favorites/${favoriteId}/`);
  }
}
