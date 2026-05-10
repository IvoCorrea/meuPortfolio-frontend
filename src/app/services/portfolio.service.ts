import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue?: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private apiUrl: string = "http://localhost:8080";

  constructor(private http: HttpClient) { };

  // Portfolio Crud

  public getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.apiUrl}/portfolio`);
  }

  public getPortfolio(id: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/portfolio/${id}`);
  }

  public createPortfolio(portfolio: Omit<Portfolio, 'id' | 'assets' | 'createdAt' | 'updatedAt'>): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.apiUrl}/portfolio`, portfolio);
  }

  public updatePortfolio(id: string, portfolio: Omit<Portfolio, 'id' | 'assets' | 'createdAt'>): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.apiUrl}/portfolio/${id}`, portfolio);
  }

  public deletePortfolio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/portfolio${id}`);
  }

  // Asset crud

  public addAsset(portfolioId: string, asset: Omit<Asset, 'id'>): Observable<Portfolio> {
    return this.http.patch<Portfolio>(`${this.apiUrl}/portfolio/${portfolioId}/asset`, asset);
  }

  public updateAsset(portfolioId: string, assetId: string, asset: Asset): Observable<Portfolio> {
    return this.http.patch<Portfolio>(`${this.apiUrl}/portfolio/${portfolioId}/asset/${assetId}`, asset);
  }

  public deleteAsset(portfolioId: string, assetId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/portfolio/${portfolioId}/asset/${assetId}`)
  }
}
