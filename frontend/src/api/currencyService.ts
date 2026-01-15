// Free currency exchange rate service using exchangerate-api.com
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export const currencyService = {
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate | null> {
    try {
      const response = await fetch(`${BASE_URL}/${from}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      const rate = data.rates[to];
      
      if (!rate) {
        throw new Error(`Exchange rate for ${to} not found`);
      }

      return {
        from,
        to,
        rate,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
  },

  async getMultipleRates(pairs: Array<[string, string]>): Promise<ExchangeRate[]> {
    try {
      // Get unique 'from' currencies
      const fromCurrencies = [...new Set(pairs.map(([from]) => from))];
      
      const results: ExchangeRate[] = [];
      
      for (const from of fromCurrencies) {
        const response = await fetch(`${BASE_URL}/${from}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Extract rates for requested pairs
        pairs.forEach(([pairFrom, pairTo]) => {
          if (pairFrom === from && data.rates[pairTo]) {
            results.push({
              from: pairFrom,
              to: pairTo,
              rate: data.rates[pairTo],
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching multiple exchange rates:', error);
      return [];
    }
  },
};
