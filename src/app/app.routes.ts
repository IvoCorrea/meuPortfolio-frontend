import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/Auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
    },
    
    {
      path: 'login',
      loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
      path: 'register',
      loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    },
    /*
    {
      path: 'dashboard',
      canActivate: [AuthGuard],
      loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    },
    {
      path: 'portfolio/:id',
      canActivate: [AuthGuard],
      loadComponent: () => import('./pages/portfolio-details/portfolio-details.component').then(m => m.PortfolioDetailsComponent),
    },*/
    {
        path: '**',
        redirectTo: '/dashboard',
    },
];