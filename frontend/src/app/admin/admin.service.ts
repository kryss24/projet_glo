import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../auth/auth.service'; // Re-use User interface from auth service
import { PaginatedResponse } from '../catalog/catalog.service'; // Re-use PaginatedResponse
import { BACKEND_API_URL } from '../config';

export interface AdminStats {
  total_users: number;
  users_by_role: { role: string; count: number }[];
  total_tests_completed: number;
  tests_started: number;
  total_academic_fields: number;
  total_institutions: number;
  // Add other stats as needed
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `${BACKEND_API_URL}/accounts/admin/`; // Admin APIs are under accounts

  constructor() { }

  // --- Statistics ---
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API_BASE_URL}stats/`);
  }

  // --- User Management ---
  getUsers(params?: HttpParams): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.API_BASE_URL}users/`, { params });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}users/${id}/`);
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_BASE_URL}users/${id}/`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}users/${id}/`);
  }
}
