import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { PasswordResetRequest } from './password-reset-request/password-reset-request';
import { PasswordResetConfirm } from './password-reset-confirm/password-reset-confirm';

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'password-reset-request', component: PasswordResetRequest },
    { path: 'password-reset-confirm/:uid/:token', component: PasswordResetConfirm },
];
