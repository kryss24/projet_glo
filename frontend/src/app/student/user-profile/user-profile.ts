import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; // Import CommonModule for ngIf
import { AuthService, User } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true, // Ensure it's marked as standalone
  imports: [CommonModule, NgIf], // Add CommonModule here
  templateUrl: './user-profile.html',
  styles: `
    .profile-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .profile-info p {
      margin-bottom: 0.5rem;
    }
    .profile-info strong {
      display: inline-block;
      width: 120px;
    }
  `,
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User | null = null;
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user profile.';
        this.loading = false;
        console.error(err);
        // Optionally redirect to login if unauthorized
        // if (err.status === 401) {
        //   this.router.navigate(['/auth/login']);
        // }
      }
    });
  }
}
