import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from '../config';

export interface Question {
  id: number;
  text: string;
  category: string;
  question_type: 'mcq' | 'likert' | 'ranking';
  options?: string[]; // For MCQ and Ranking
}

export interface TestResponse {
  id?: number;
  orientation_test?: number;
  question: number;
  answer: any; // Can be string, number, or array based on question type
}

export interface Recommendation {
  id?: number;
  orientation_test?: number;
  recommended_fields: number[]; // Array of Field IDs
  compatibility_scores: { [fieldId: string]: number };
  justification?: string;
  generated_at?: string;
}

export interface OrientationTest {
  id?: number;
  user?: number;
  started_at?: string;
  completed_at?: string | null;
  is_completed: boolean;
  scores_data?: { [category: string]: number };
  responses?: TestResponse[];
  recommendation?: Recommendation;
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
export class OrientationService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `${BACKEND_API_URL}/orientation/`;

  constructor() { }

  // --- Questions ---
  getQuestions(params?: HttpParams): Observable<PaginatedResponse<Question>> {
    return this.http.get<PaginatedResponse<Question>>(`${this.API_BASE_URL}questions/`, { params });
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.API_BASE_URL}questions/${id}/`);
  }

  // --- Orientation Tests ---
  startTest(): Observable<OrientationTest> {
    return this.http.post<OrientationTest>(`${this.API_BASE_URL}tests/start/`, {});
  }

  submitResponse(testId: number, responseData: TestResponse): Observable<TestResponse> {
    return this.http.post<TestResponse>(`${this.API_BASE_URL}tests/${testId}/submit-response/`, responseData);
  }

  completeTest(testId: number): Observable<OrientationTest> {
    return this.http.post<OrientationTest>(`${this.API_BASE_URL}tests/${testId}/complete/`, {});
  }

  getTestResult(testId: number): Observable<OrientationTest> {
    return this.http.get<OrientationTest>(`${this.API_BASE_URL}tests/${testId}/result/`);
  }

  getUserTests(): Observable<PaginatedResponse<OrientationTest>> {
    return this.http.get<PaginatedResponse<OrientationTest>>(`${this.API_BASE_URL}my-tests/`);
  }
}
