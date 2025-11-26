import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styles: `
    .home-container {
      text-align: center;
    }
    .hero-section {
      padding: 4rem 2rem;
      background-color: var(--color-primary);
      color: white;
    }
    .hero-section h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .hero-section p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    .cta-button {
      background-color: var(--color-secondary);
      color: var(--color-text-dark);
      padding: 1rem 2rem;
      border-radius: 5px;
      font-size: 1.1rem;
      font-weight: bold;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }
    .cta-button:hover {
      background-color: #e0b814;
    }
    .features-section {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 3rem 2rem;
      flex-wrap: wrap;
    }
    .feature-card {
      background-color: #fff;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 2rem;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .feature-card h3 {
      color: var(--color-primary);
      margin-bottom: 1rem;
    }
    .feature-card a {
      display: inline-block;
      margin-top: 1rem;
      color: var(--color-accent);
      font-weight: bold;
    }
  `,
})
export class Home {

}
