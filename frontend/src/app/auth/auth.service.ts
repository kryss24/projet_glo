import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BACKEND_API_URL } from '../config';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_id?: number; // from token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_BASE_URL = `${BACKEND_API_URL}/accounts`;

  public isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidTokens());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  public user: User | null = null;

  constructor() {
    if (this.hasValidTokens()) {
      const token = this.getAccessToken();
      if (token) {
        this.user = jwtDecode(token);
      }
    }
  }

  private hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }
    try {
      const decodedToken: any = jwtDecode(accessToken);
      const isExpired = decodedToken.exp * 1000 < Date.now();
      return !isExpired;
    } catch (error) {
      return false;
    }
  }

  private saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.user = jwtDecode(tokens.access);
    this.isAuthenticatedSubject.next(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.user = null;
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/register/`, userData);
  }

  login(credentials: any): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API_BASE_URL}/token/`, credentials).pipe(
      tap(tokens => this.saveTokens(tokens))
    );
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return new Observable(observer => observer.error('No refresh token available.'));
    }
    return this.http.post<AuthTokens>(`${this.API_BASE_URL}/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(tokens => this.saveTokens(tokens))
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/password-reset/`, { email });
  }

  confirmPasswordReset(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/password-reset/confirm/`, data);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/profile/`);
  }
}
