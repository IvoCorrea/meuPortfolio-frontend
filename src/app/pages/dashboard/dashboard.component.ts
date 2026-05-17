import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import { AuthService } from '../../core/auth/Auth.service';
import { Router } from '@angular/router';

import { Asset, Portfolio } from '../../services/portfolio.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected portfolios: Portfolio[] = [];
  protected selectedPortfolio: Portfolio | null = null;
  protected isLoading: boolean = false;
  protected error: string = '';

  protected showCreatePortfolioModal: boolean = false;
  protected showAddAssetModal: boolean = false;

  protected portfolioName: string = '';

  protected assetData: Partial<Asset> = {
    ticker: '',
    name: '',
    type: 'ACAO',
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0
  };

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
    if (!this.portfolioName) {
      this.error = "Nome do Portfolio invalido";
      return;
    }

    this.isLoading = true;

    this.portfolioService.createPortfolio({
      name: this.portfolioName
    }).subscribe({
      next: (newPotfolio) => {
        this.portfolios.push(newPotfolio);
        this.selectPortfolio(newPotfolio.id);

        this.showCreatePortfolioModal = false;
        this.portfolioName = '';

        this.isLoading = false;
      },
      error: (error) => {
        this.error = ('Erro ao criar Portfolio')
        console.error(error);
      }
    })

  }

  protected createAsset() {
    if (!this.selectedPortfolio || !this.assetData.ticker || !this.assetData.name || !this.assetData.type || this.assetData.quantity! <= 0 || this.assetData.purchasePrice! <= 0 || this.assetData.currentPrice! <= 0) {
      this.error = "Dados do ativo inválidos";
      return;
    }

    this.isLoading = true;
    this.portfolioService.addAsset(this.selectedPortfolio!.id, this.assetData as Omit<Asset, 'id'>).subscribe({
      next: (portfolioNewAsset) => {
        this.selectedPortfolio = portfolioNewAsset;
      },
      error: (error) => {
        this.error = "Erro ao adicionar asset"
        console.error(error);
      }
    });
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