import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
          // Client-side errors
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side errors
          if (error.status) {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
          if (error.error && error.error.detail) {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.detail}`;
          } else if (error.error) {
            // Handle specific backend validation errors
            if (typeof error.error === 'object') {
              let validationMessages: string[] = [];
              for (const key in error.error) {
                if (error.error.hasOwnProperty(key)) {
                  validationMessages.push(`${key}: ${error.error[key]}`);
                }
              }
              errorMessage = `Validation Errors:\n${validationMessages.join('\n')}`;
            }
          }

          // Handle specific HTTP statuses
          switch (error.status) {
            case 401: // Unauthorized
              console.error('Unauthorized request. Redirecting to login...');
              this.router.navigate(['/auth/login']);
              break;
            case 403: // Forbidden
              console.error('Forbidden access. You do not have permission.');
              // Maybe redirect to an access denied page
              break;
            case 404: // Not Found
              console.error('Resource not found.');
              break;
            case 500: // Internal Server Error
              console.error('Internal server error. Please try again later.');
              break;
          }
        }
        console.error('HTTP Error caught by interceptor:', error);
        alert(`Error: ${errorMessage}`); // Simple alert for now
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
