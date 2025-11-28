import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token d'accès
    const token = this.authService.getAccessToken();

    // Cloner la requête et ajouter le header Authorization si le token existe
    let clonedRequest = request;
    if (token) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Envoyer la requête et gérer les erreurs 401
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si l'erreur est 401 et qu'on a un refresh token
        if (error.status === 401 && this.authService.getRefreshToken()) {
          // Tenter de rafraîchir le token
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              // Réessayer la requête avec le nouveau token
              const newToken = this.authService.getAccessToken();
              const retryRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next.handle(retryRequest);
            }),
            catchError((refreshError) => {
              // Si le refresh échoue, déconnecter l'utilisateur
              this.authService.logout();
              return throwError(() => refreshError);
            })
          );
        }

        // Pour les autres erreurs, les propager
        return throwError(() => error);
      })
    );
  }
}