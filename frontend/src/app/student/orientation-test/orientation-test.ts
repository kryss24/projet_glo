import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { OrientationService, Question, OrientationTest as BackendOrientationTest } from '../../orientation/orientation.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-orientation-test',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './orientation-test.html',
  styles: `
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
    .options-group input[type="radio"], .options-group input[type="checkbox"] {
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
})
export class OrientationTest implements OnInit {
  private orientationService = inject(OrientationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  testId: number | null = null;
  loading: boolean = true;
  error: string | null = null;
  isResuming: boolean = false;
  answeredQuestions: Set<number> = new Set(); // Pour suivre les questions déjà répondues
  
  testForm = new FormGroup({});

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour passer le test.');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Vérifier si on reprend un test existant
    this.route.queryParams.subscribe(params => {
      const testId = params['testId'];
      if (testId) {
        this.isResuming = true;
        this.testId = Number(testId);
        this.resumeTest();
      } else {
        // Vérifier s'il existe déjà un test actif avant d'en créer un nouveau
        this.checkForActiveTest();
      }
    });
  }

  checkForActiveTest(): void {
    this.loading = true;
    this.orientationService.getUserTests().subscribe({
      next: (response: any) => {
        const tests = Array.isArray(response) ? response : (response?.results || []);
        const activeTest = tests.find((test: any) => !test.is_completed);
        
        if (activeTest) {
          // Un test actif existe, le reprendre automatiquement
          this.isResuming = true;
          this.testId = activeTest.id;
          this.resumeTest();
        } else {
          // Aucun test actif, en créer un nouveau
          this.startNewTest();
        }
      },
      error: (err: any) => {
        console.error('Error checking for active test:', err);
        // En cas d'erreur, essayer de créer un nouveau test
        this.startNewTest();
      }
    });
  }

  startNewTest(): void {
    this.loading = true;
    this.error = null;
    
    this.orientationService.startTest().subscribe({
      next: (test: BackendOrientationTest) => {
        this.testId = test.id as number;
        this.loadQuestions();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error starting test:', err);
        
        if (err.status === 400) {
          const errorMessage = err.originalError?.error?.detail || err.message || '';
          
          if (errorMessage.includes('active test already exists') || 
              errorMessage.includes('test actif existe')) {
            alert("Un test actif existe déjà. Vous allez être redirigé vers votre tableau de bord.");
            this.router.navigate(['/student/dashboard']);
            return;
          }
        }
        
        this.error = 'Impossible de démarrer le test. Veuillez réessayer.';
      }
    });
  }

  resumeTest(): void {
    this.loading = true;
    this.error = null;
    
    // Charger les réponses existantes et les questions
    this.orientationService.getTestResponses(this.testId!).subscribe({
      next: (responses: any[]) => {
        // Marquer les questions déjà répondues
        responses.forEach(response => {
          this.answeredQuestions.add(response.question);
        });
        
        this.loadQuestions();
      },
      error: (err: any) => {
        console.error('Error loading test responses:', err);
        this.error = 'Impossible de charger le test. Le test sera redémarré.';
        this.isResuming = false;
        this.loadQuestions();
      }
    });
  }

  loadQuestions(): void {
    this.orientationService.getQuestions().subscribe({
      next: (response: any) => {
        this.questions = response.results || response;
        
        if (this.questions.length > 0) {
          // Si on reprend, trouver la première question non répondue
          if (this.isResuming && this.answeredQuestions.size > 0) {
            const firstUnanswered = this.questions.findIndex(
              q => !this.answeredQuestions.has(q.id)
            );
            this.currentQuestionIndex = firstUnanswered !== -1 ? firstUnanswered : 0;
          }
          
          this.initializeFormForCurrentQuestion();
        } else {
          this.error = 'Aucune question disponible pour le test.';
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Impossible de charger les questions.';
        this.loading = false;
        console.error('Error loading questions:', err);
      }
    });
  }

  initializeFormForCurrentQuestion(): void {
    if (this.questions.length === 0) return;

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const controlName = `question_${currentQuestion.id}`;

    // Clear previous controls
    Object.keys(this.testForm.controls).forEach(key => this.testForm.removeControl(key));
    
    // Add new control for current question
    this.testForm.addControl(controlName, new FormControl('', Validators.required));
  }

  get currentQuestion(): Question | null {
    return this.questions.length > 0 ? this.questions[this.currentQuestionIndex] : null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    
    // Calculer le progrès basé sur les questions répondues + la question actuelle
    const totalAnswered = this.answeredQuestions.size;
    const progressValue = (totalAnswered / this.questions.length) * 100;
    
    return Math.min(progressValue, 100);
  }

  get questionsAnswered(): number {
    return this.answeredQuestions.size;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.answeredQuestions.has(questionId);
  }

  nextQuestion(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      alert('Veuillez répondre à la question avant de continuer.');
      return;
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.submitCurrentResponse().subscribe({
        next: () => {
          // Marquer la question comme répondue
          if (this.currentQuestion) {
            this.answeredQuestions.add(this.currentQuestion.id);
          }"Littérature et langues"
          
          this.currentQuestionIndex++;
          this.initializeFormForCurrentQuestion();
          this.error = null;
        },
        error: (err: any) => {
          console.error('Error submitting response:', err);
          this.error = 'Impossible de soumettre la réponse. Veuillez réessayer.';
        }
      });
    }
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
      return throwError(() => new Error('Test non démarré ou question invalide.'));
    }

    if (!this.testForm.valid) {
      this.testForm.markAllAsTouched();
      return throwError(() => new Error('Formulaire invalide.'));
    }

    const currentQuestion = this.currentQuestion;
    const controlName = `question_${currentQuestion.id}`;
    const answer = this.testForm.get(controlName)?.value;

    const responseData = {
      question_id: currentQuestion.id,
      answer: answer
    };

    return this.orientationService.submitResponse(this.testId, responseData);
  }

  finishTest(): void {
    if (!this.testId) {
      this.error = 'Test non démarré.';
      return;
    }

    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      alert('Veuillez répondre à la dernière question avant de terminer.');
      return;
    }

    this.loading = true;
    
    this.submitCurrentResponse().subscribe({
      next: () => {
        // Marquer la dernière question comme répondue
        if (this.currentQuestion) {
          this.answeredQuestions.add(this.currentQuestion.id);
        }
        
        this.orientationService.completeTest(this.testId as number).subscribe({
          next: (test: BackendOrientationTest) => {
            this.loading = false;
            alert('Test terminé avec succès ! Vous allez être redirigé vers vos résultats.');
            this.router.navigate(['/student/test-result', test.id]);
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error completing test:', err);
            this.error = 'Impossible de terminer le test. Veuillez réessayer.';
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error submitting final response:', err);
        this.error = 'Impossible de soumettre la dernière réponse. Veuillez réessayer.';
      }
    });
  }
}