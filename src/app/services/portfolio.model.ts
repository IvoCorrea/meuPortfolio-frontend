export interface Asset {
    id: string;
    ticker: string;
    type: 'ACAO' | 'FUNDO' | 'CRIPTO'; // enum
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue?: number;
}

export interface Portfolio {
    id: string;
    name: string;
    assets: Asset[];
    totalInvested?: number;
    totalValue?: number;
    totalProfit?: number;
    profitPercentage?: number;
    createdAt: string;
}
