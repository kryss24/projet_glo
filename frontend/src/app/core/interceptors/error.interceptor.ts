import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          console.error('Client-side error:', error.error.message);
          errorMessage = `Erreur client: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          console.error(`Server-side error: ${error.status}`, error.error);
          
          switch (error.status) {
            case 0:
              errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
              break;
            case 400:
              errorMessage = error.error?.message || 'Requête invalide';
              break;
            case 401:
              // Ne pas gérer le 401 ici, c'est AuthInterceptor qui s'en charge
              console.log('Unauthorized request. Redirecting to login...');
              break;
            case 403:
              errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée';
              break;
            case 500:
              errorMessage = 'Erreur serveur interne';
              break;
            case 503:
              errorMessage = 'Service temporairement indisponible';
              break;
            default:
              errorMessage = error.error?.message || error.message || errorMessage;
          }
        }

        console.error('HTTP Error caught by interceptor:', {
          status: error.status,
          message: errorMessage,
          error: error
        });

        // Retourner l'erreur avec un message formaté
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          originalError: error
        }));
      })
    );
  }
}