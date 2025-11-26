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
    .result-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .result-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .result-header h2 {
      color: var(--color-primary);
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    .score-section, .recommendation-section {
      margin-bottom: 2rem;
      border-top: 1px solid var(--color-border);
      padding-top: 1.5rem;
    }
    .score-item, .recommended-field-item {
      margin-bottom: 0.8rem;
    }
    .score-item strong, .recommended-field-item strong {
      display: inline-block;
      width: 180px;
      font-weight: 600;
    }
    .recommended-field-item a {
      color: var(--color-primary);
      font-weight: bold;
    }
    .compatibility-bar {
      height: 15px;
      background-color: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .compatibility-fill {
      height: 100%;
      background-color: var(--color-secondary);
      border-radius: 5px;
      text-align: right;
      color: var(--color-text-dark);
      line-height: 15px;
      font-size: 0.8rem;
      padding-right: 5px;
      box-sizing: border-box;
    }
    .no-results {
      text-align: center;
      color: var(--gray-700);
    }
  `,
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
