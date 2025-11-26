import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { OrientationService, Question, OrientationTest as BackendOrientationTest } from '../../orientation/orientation.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Observable } from 'rxjs'; // Import Observable

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
  `,
})
export class OrientationTest implements OnInit {
  private orientationService = inject(OrientationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  testId: number | null = null;
  loading: boolean = true;
  error: string | null = null;
  
  testForm = new FormGroup({}); // Will dynamically add controls

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSubject.value) {
      alert('Veuillez vous connecter pour passer le test.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.startNewTest();
  }

  startNewTest(): void {
    this.loading = true;
    this.error = null;
    this.orientationService.startTest().subscribe({
      next: (test: BackendOrientationTest) => {
        this.testId = test.id as number;
        this.loadQuestions();
      },
      error: (err: any) => { // Explicitly type err
        this.error = 'Failed to start test.';
        this.loading = false;
        console.error(err);
        if (err.status === 400 && err.error.detail.includes("An active test already exists")) {
            alert("Un test actif existe déjà. Vous allez être redirigé vers vos résultats.");
            this.router.navigate(['/student/dashboard']); // Assuming dashboard shows latest test results
        }
      }
    });
  }

  loadQuestions(): void {
    this.orientationService.getQuestions().subscribe({
      next: (response: any) => {
        this.questions = response.results;
        if (this.questions.length > 0) {
          this.initializeFormForCurrentQuestion();
        } else {
          this.error = 'No questions available for the test.';
        }
        this.loading = false;
      },
      error: (err: any) => { // Explicitly type err
        this.error = 'Failed to load questions.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  initializeFormForCurrentQuestion(): void {
    if (this.questions.length === 0) return;

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const controlName = `question_${currentQuestion.id}`;

    // Clear previous controls if any
    Object.keys(this.testForm.controls).forEach(key => this.testForm.removeControl(key));
    
    // Add new control for current question
    this.testForm.addControl(controlName, new FormControl('', Validators.required));
  }

  get currentQuestion(): Question | null {
    return this.questions.length > 0 ? this.questions[this.currentQuestionIndex] : null;
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.submitCurrentResponse().subscribe({
        next: () => {
          this.currentQuestionIndex++;
          this.initializeFormForCurrentQuestion();
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error submitting response:', err);
          this.error = 'Failed to submit response. Please try again.';
        }
      });
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.initializeFormForCurrentQuestion();
    }
  }

  submitCurrentResponse(): Observable<any> {
    if (!this.testId || !this.currentQuestion || !this.testForm.valid) {
      this.testForm.markAllAsTouched();
      return new Observable((observer: any) => observer.error('Form is invalid or test not started.')); // Explicitly type observer
    }

    const currentQuestion = this.currentQuestion;
    const controlName = `question_${currentQuestion.id}`;
    const answer = this.testForm.get(controlName)?.value;

    const responseData = {
      question: currentQuestion.id,
      answer: answer
    };

    return this.orientationService.submitResponse(this.testId, responseData);
  }

  finishTest(): void {
    if (!this.testId) {
      this.error = 'Test not started.';
      return;
    }
    this.submitCurrentResponse().subscribe({
      next: () => {
        this.orientationService.completeTest(this.testId as number).subscribe({
          next: (test: BackendOrientationTest) => {
            alert('Test terminé ! Vous allez être redirigé vers vos résultats.');
            this.router.navigate(['/student/test-result', test.id]); // Navigate to results page
          },
          error: (err: any) => { // Explicitly type err
            console.error('Error completing test:', err);
            this.error = 'Failed to complete test.';
          }
        });
      },
      error: (err: any) => { // Explicitly type err
        console.error('Error submitting final response:', err);
        this.error = 'Failed to submit final response. Please try again.';
      }
    });
  }
}
