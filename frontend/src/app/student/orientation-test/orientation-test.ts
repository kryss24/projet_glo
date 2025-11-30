import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import {
  OrientationService,
  Question,
  OrientationTest as BackendOrientationTest,
  PaginatedResponse,
} from '../../orientation/orientation.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import {
  Observable,
  throwError,
  forkJoin,
  of ,
  switchMap,
  catchError,
  map,
  timeout,
} from 'rxjs';

@Component({
  selector: 'app-orientation-test',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './orientation-test.html',
  styles: [
    `
      .test-container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .progress-bar {
        width: 100%;
        background-color: #e0e0e0;
        border-radius: 5px;
        margin-bottom: 2rem;
      }
      .progress-bar-fill {
        height: 20px;
        background-color: var(--color-primary);
        border-radius: 5px;
        text-align: center;
        color: white;
        line-height: 20px;
        transition: width 0.5s ease-in-out;
      }
      .question-card {
        padding: 1.5rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }
      .question-card h3 {
        margin-bottom: 1rem;
        color: var(--color-primary);
      }
      .options-group label {
        display: block;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
      .options-group input[type='radio'],
      .options-group input[type='checkbox'] {
        margin-right: 0.5rem;
      }
      .likert-scale {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
      }
      .likert-scale label {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      .navigation-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
      }
      .navigation-buttons button {
        background-color: var(--color-primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
      }
      .navigation-buttons button:not(:disabled) {
        background-color: #2563eb; /* A shade of blue */
      }
      .navigation-buttons button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      .finish-button {
        background-color: var(--color-accent);
      }
      .finish-button:hover {
        opacity: 0.9;
      }
      .error-message {
        background-color: #fee;
        color: #c33;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
      }
      .loading-message {
        text-align: center;
        padding: 2rem;
        color: #666;
      }
      .resume-banner {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 2px solid #fbbf24;
        color: #92400e;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-weight: 500;
        text-align: center;
      }
    `,
  ],
})
export class OrientationTest implements OnInit {
  private orientationService = inject(OrientationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  testId: number | null = null;
  loading: boolean = true;
  error: string | null = null;
  isResuming: boolean = false;
  answeredQuestions: Set<number> = new Set();

  testForm = new FormGroup({});

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour passer le test.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;

    this.route.queryParams
      .pipe(
        switchMap((params) => {
          const testId = params['testId'];
          if (testId) {
            return this.loadTestData(Number(testId));
          } else {
            return this.findAndLoadActiveTest();
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.testId = data.testId;
          this.questions = data.questions;
          this.answeredQuestions = data.answeredQuestions;
          this.isResuming = data.isResuming;

          if (this.questions.length > 0) {
            if (this.isResuming && this.answeredQuestions.size > 0) {
              const firstUnanswered = this.questions.findIndex(
                (q) => !this.answeredQuestions.has(q.id)
              );
              this.currentQuestionIndex =
                firstUnanswered !== -1 ? firstUnanswered : 0;
            }
            this.initializeFormForCurrentQuestion();
          } else {
            this.error = 'Aucune question disponible pour le test.';
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error =
            err.message || 'Une erreur est survenue lors du chargement du test.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private findAndLoadActiveTest(): Observable<TestData> {
    return this.orientationService.getUserTests().pipe(
      timeout(15000),
      switchMap(
        (
          response:
            | PaginatedResponse<BackendOrientationTest>
            | BackendOrientationTest[]
        ) => {
          const tests = Array.isArray(response)
            ? response
            : response?.results || [];
          const activeTest = tests.find(
            (test) => !test.is_completed && test.id != null
          );

          if (activeTest && activeTest.id) {
            return this.loadTestData(activeTest.id, true);
          } else {
            return this.createNewTest();
          }
        }
      ),
      catchError((err) => {
        console.error('Error checking for active test, creating new one:', err);
        return this.createNewTest();
      })
    );
  }

  private createNewTest(): Observable<TestData> {
    return this.orientationService.startTest().pipe(
      timeout(15000),
      switchMap((test) => {
        if (test.id == null) {
          return throwError(() => new Error('Test ID is missing after starting new test.'));
        }
        return this.loadTestData(test.id, false);
      }),
      catchError((err) => {
        if (
          err.status === 400 &&
          err.originalError?.error?.detail?.includes('active test')
        ) {
          alert(
            'Un test actif existe déjà. Vous allez être redirigé vers votre tableau de bord.'
          );
          this.router.navigate(['/student/dashboard']);
          return throwError(
            () => new Error('Un test actif existe déjà. Redirection...')
          );
        }
        return throwError(
          () => new Error('Impossible de démarrer un nouveau test.')
        );
      })
    );
  }

  private loadTestData(
    testId: number,
    isResuming: boolean = true
  ): Observable<TestData> {
    const questions$ = this.orientationService
      .getQuestions()
      .pipe(timeout(15000), map((res) => res.results || res));

    const responses$ = isResuming
      ? this.orientationService
          .getTestResponses(testId)
          .pipe(timeout(15000), catchError(() => of([])))
      : of([]);

    return forkJoin([questions$, responses$]).pipe(
      map(([questions, responses]) => {
        const answeredQuestions = new Set(
          responses.map((r: any) => r.question)
        );
        return {
          testId,
          questions,
          answeredQuestions,
          isResuming,
        };
      })
    );
  }

  initializeFormForCurrentQuestion(): void {
    if (this.questions.length === 0) return;

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const controlName = `question_${currentQuestion.id}`;

    Object.keys(this.testForm.controls).forEach((key) =>
      this.testForm.removeControl(key)
    );

    this.testForm.addControl(
      controlName,
      new FormControl('', Validators.required)
    );
  }

  get currentQuestion(): Question | null {
    return this.questions.length > 0
      ? this.questions[this.currentQuestionIndex]
      : null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    const progressValue =
      (this.answeredQuestions.size / this.questions.length) * 100;
    return Math.min(progressValue, 100);
  }

  get questionsAnswered(): number {
    return this.answeredQuestions.size;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  nextQuestion(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      alert('Veuillez répondre à la question avant de continuer.');
      return;
    }

    this.submitCurrentResponse().subscribe({
      next: () => {
        if (this.currentQuestion) {
          this.answeredQuestions.add(this.currentQuestion.id);
        }

        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
          this.initializeFormForCurrentQuestion();
          this.error = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error submitting response:', err);
        this.error = 'Impossible de soumettre la réponse. Veuillez réessayer.';
        this.cdr.detectChanges();
      },
    });
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.initializeFormForCurrentQuestion();
      this.error = null;
    }
  }

  submitCurrentResponse(): Observable<any> {
    if (!this.testId || !this.currentQuestion) {
      return throwError(
        () => new Error('Test non démarré ou question invalide.')
      );
    }

    if (!this.testForm.valid) {
      return throwError(() => new Error('Formulaire invalide.'));
    }

    const controlName = `question_${this.currentQuestion.id}`;
    const answer = this.testForm.get(controlName)?.value;

    return this.orientationService.submitResponse(this.testId, {
      question_id: this.currentQuestion.id,
      answer: answer,
    });
  }

  finishTest(): void {
    if (!this.testId) {
      this.error = 'ID de test invalide, impossible de terminer.';
      this.cdr.detectChanges();
      return;
    }

    if (this.testForm.invalid && this.currentQuestion) {
      alert('Veuillez répondre à la dernière question avant de terminer.');
      return;
    }

    this.loading = true;
    const finalResponse$ = this.currentQuestion
      ? this.submitCurrentResponse()
      : of(null);

    finalResponse$.pipe(
        switchMap(() => this.orientationService.completeTest(this.testId as number))
      )
      .subscribe({
        next: (test) => {
          this.loading = false;
          alert(
            'Test terminé avec succès ! Vous allez être redirigé vers vos résultats.'
          );
          if (test.id == null) {
            console.error('Test completed, but returned test object is missing an ID.');
            this.error = 'Test terminé, mais impossible d\'afficher les résultats (ID manquant).';
            this.cdr.detectChanges();
            return;
          }
          this.router.navigate(['/student/test-result', test.id]);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Impossible de terminer le test. Veuillez réessayer.';
          console.error('Error completing test:', err);
          this.cdr.detectChanges();
        },
      });
  }
}

interface TestData {
  testId: number;
  questions: Question[];
  answeredQuestions: Set<number>;
  isResuming: boolean;
}