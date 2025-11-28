import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styles: `
    .home-container {
      max-width: 100%;
      margin: 0 auto;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 4rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
      flex-wrap: wrap;
    }

    .hero-content {
      flex: 1;
      min-width: 300px;
      max-width: 600px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .badge-icon {
      font-size: 1.2rem;
    }

    .hero-section h1 {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #fbbf24;
      color: #1f2937;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cta-button:hover {
      background: #f59e0b;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .arrow {
      font-size: 1.3rem;
      transition: transform 0.3s ease;
    }

    .cta-button:hover .arrow {
      transform: translateX(4px);
    }

    .hero-image {
      flex: 1;
      min-width: 300px;
      max-width: 400px;
    }

    .illustration-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
    }

    .illustration-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .illustration-card h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .illustration-card p {
      opacity: 0.9;
    }

    /* Statistics Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      padding: 3rem 2rem;
      background: #f9fafb;
    }

    .stat-card {
      text-align: center;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #6b7280;
      font-weight: 500;
    }

    /* Process Section */
    .process-section {
      padding: 4rem 2rem;
      text-align: center;
      background: white;
    }

    .process-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.2rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .step-card {
      position: relative;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      text-align: left;
      transition: all 0.3s ease;
    }

    .step-card:hover {
      border-color: #2563eb;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
    }

    .step-number {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      background: #dbeafe;
      color: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .step-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .step-card h3 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.75rem;
    }

    .step-card p {
      color: #6b7280;
      line-height: 1.7;
    }

    /* Features Section */
    .features-section {
      padding: 4rem 2rem;
      background: #f9fafb;
    }

    .features-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .feature-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .feature-card > p {
      color: #6b7280;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
    }

    .feature-list li {
      padding: 0.5rem 0;
      color: #4b5563;
      position: relative;
      padding-left: 1.5rem;
    }

    .feature-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: 700;
    }

    .feature-link {
      display: inline-block;
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .feature-link:hover {
      color: #1e40af;
    }

    /* Testimonials Section */
    .testimonials-section {
      padding: 4rem 2rem;
      background: white;
    }

    .testimonials-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .testimonial-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      position: relative;
    }

    .quote-icon {
      font-size: 3rem;
      color: #2563eb;
      opacity: 0.2;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .testimonial-text {
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 1.5rem;
      font-style: italic;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .author-avatar {
      width: 50px;
      height: 50px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .author-name {
      font-weight: 600;
      color: #1f2937;
    }

    .author-program {
      font-size: 0.9rem;
      color: #6b7280;
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }

    .cta-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-section p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-button-large {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #fbbf24;
      color: #1f2937;
      padding: 1.25rem 2.5rem;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cta-button-large:hover {
      background: #f59e0b;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .cta-button-large .arrow {
      font-size: 1.5rem;
      transition: transform 0.3s ease;
    }

    .cta-button-large:hover .arrow {
      transform: translateX(4px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-section {
        text-align: center;
        padding: 3rem 1.5rem;
      }

      .hero-content {
        max-width: 100%;
      }

      .hero-section h1 {
        font-size: 2rem;
      }

      .hero-description {
        font-size: 1rem;
      }

      .process-section h2,
      .features-section h2,
      .testimonials-section h2,
      .cta-section h2 {
        font-size: 2rem;
      }

      .stat-number {
        font-size: 2rem;
      }
    }
  `,
})
export class Home {
}
