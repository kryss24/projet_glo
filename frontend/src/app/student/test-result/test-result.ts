import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor, KeyValuePipe } from '@angular/common'; // Import KeyValuePipe
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrientationService, OrientationTest as BackendOrientationTest, Recommendation } from '../../orientation/orientation.service';
import { CatalogService, Field } from '../../catalog/catalog.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-test-result',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, KeyValuePipe, RouterLink], // Add KeyValuePipe here
  templateUrl: './test-result.html',
  styles: `
  /* GLOBAL CONTAINER */
  .result-container {
    max-width: 1000px;
    margin: 2.5rem auto;
    padding: 2rem;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
    animation: fadeIn 0.6s ease;
  }

  /* FADE ANIMATION */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* HEADER */
  .result-header {
    text-align: center;
    padding: 2rem;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }

  .result-header h2 {
    font-size: 2.4rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.15);
    margin-bottom: 0.3rem;
  }

  .result-header p {
    font-size: 1.1rem;
    opacity: 0.95;
  }

  /* ERROR DISPLAY */
  .text-red-500 {
    color: #dc3545 !important;
  }

  .error-container {
    background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid #ffccd5;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  /* SCORE SECTION */
  .score-section {
    margin-top: 2rem;
    padding: 2rem;
    border-radius: 16px;
    background: #f8fafc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .score-section h3 {
    font-size: 1.7rem;
    color: #2d3748;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .score-item {
    margin-bottom: 1.4rem;
    font-size: 1.1rem;
    font-weight: 500;
    color: #4a5568;
  }

  .score-item strong {
    color: #2d3748;
    font-weight: 700;
  }

  /* PROGRESS BAR */
  .compatibility-bar {
    height: 18px;
    background: #edf2f7;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 6px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
  }

  .compatibility-fill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.8s ease;
  }

  /* RECOMMENDATIONS SECTION */
  .recommendation-section {
    margin-top: 3rem;
    padding: 2rem;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid #f0f0f0;
  }

  .recommendation-section h3 {
    font-size: 1.9rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 1.5rem;
  }

  .recommendation-section p {
    color: #4a5568;
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .recommended-field-item {
    padding: 1.2rem;
    border-radius: 10px;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
  }

  .recommended-field-item:hover {
    background: #eef2ff;
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(102, 126, 234, 0.25);
  }

  .recommended-field-item a {
    color: #667eea;
    font-weight: 700;
    text-decoration: none;
  }

  .recommended-field-item a:hover {
    text-decoration: underline;
  }

  /* EMPTY STATE */
  .no-results {
    padding: 2rem;
    text-align: center;
    font-size: 1.1rem;
    color: #718096;
  }

  .no-results::before {
    content: "📄";
    font-size: 3rem;
    display: block;
    opacity: 0.4;
    margin-bottom: 1rem;
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .result-container {
      padding: 1rem;
    }

    .result-header h2 {
      font-size: 1.9rem;
    }

    .score-section, .recommendation-section {
      padding: 1.5rem;
    }

    .recommended-field-item {
      padding: 1rem;
    }
  }
`
,
})
export class TestResult implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orientationService = inject(OrientationService);
  private catalogService = inject(CatalogService);

  testResult: BackendOrientationTest | null = null;
  recommendation: Recommendation | null = null;
  recommendedFields: Field[] = [];
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const testId = params.get('id');
      if (testId) {
        this.loadTestResult(Number(testId));
      } else {
        this.error = 'Test ID not provided.';
        this.loading = false;
      }
    });
  }

  loadTestResult(id: number): void {
    this.loading = true;
    this.error = null;
    this.orientationService.getTestResult(id).subscribe({
      next: (data) => {
        this.testResult = data;
        this.recommendation = data.recommendation || null;
        if (this.recommendation && this.recommendation.recommended_fields.length > 0) {
          this.loadRecommendedFields(this.recommendation.recommended_fields);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load test results.';
        this.loading = false;
        console.error(err);
        this.router.navigate(['/student']); // Redirect to student dashboard on error
      }
    });
  }

  loadRecommendedFields(fieldIds: number[]): void {
    const fieldRequests = fieldIds.map(id => this.catalogService.getField(id));
    forkJoin(fieldRequests).subscribe({
      next: (fields) => {
        this.recommendedFields = fields;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recommended field details:', err);
        this.error = 'Failed to load details for recommended fields.';
        this.loading = false;
      }
    });
  }
}
