import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Portfolio, PortfolioService } from '../../services/portfolio.service';
import { AuthService } from '../../core/auth/Auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected portfolios: Portfolio[] = [];
  protected selectedPortfolio: Portfolio | null = null;
  protected isLoading: boolean = false;
  protected error: string = '';

  // Services
  private authService = inject(AuthService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);

  protected ngOnInit() {
    this.loadPortfolios();
  }

  protected loadPortfolios() {
    this.isLoading = true;
    this.error = '';

    this.portfolioService.getPortfolios().subscribe({
      next: (portfolios) => {
        portfolios = portfolios;
        this.isLoading = false;

        if (portfolios.length > 0) {
          this.selectPortfolio(portfolios[0].id);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.error = 'Portfolio não encontrado';
        }
        console.error(error);
      }
    });
  }

  protected selectPortfolio(id: string) {
    if (!id) {
      this.selectedPortfolio = null;
      return;
    }
    this.isLoading = true;
    this.portfolioService.getPortfolio(id).subscribe({
      next: (portfolio) => {
        this.selectedPortfolio = portfolio;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.error = 'Portfolio não encontrado';
        }
        if (error.status === 403) {
          this.error = 'Acesso negado ao portfolio';
        }
        this.error = 'Erro ao carregar portfolio';
        console.error(error);
      }
    });
  }

  protected createPortfolio() {

  }

  protected createAsset() {

  }

  protected deletePortfolio(id: string) {
    this.portfolioService.deletePortfolio(id).subscribe({
      next: () => {
        this.selectedPortfolio = null;
        this.portfolios = this.portfolios.filter(p => p.id !== id);
      },
      error: (error) => {
        this.error = 'Erro ao deletar portfolio';
        console.error(error);
      }
    });
  }

  protected deleteAsset(portfolioId: string, assetId: string) {
    this.portfolioService.deleteAsset(portfolioId, assetId).subscribe({
      next: () => {
        this.selectedPortfolio!.assets = this.selectedPortfolio!.assets.filter(a => a.id !== assetId);
      },
      error: (error) => {
        this.error = 'Erro ao deletar ativo';
        console.error(error);
      }
    });
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/login'])
  }
}