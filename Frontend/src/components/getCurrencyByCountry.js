// utils/getUserCurrency.js (recommended) or just paste in both files
export const getCurrencyByCountry = (countryCode) => {
  const code = (countryCode || 'IN').toUpperCase();

  // Eurozone countries (partial list – add more if you have traffic from them)
  const eurozone = new Set([
    'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR',
    'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK'
    // add others like CY, MT if needed
  ]);

  if (code === 'IN') return 'INR';
  if (code === 'GB') return 'GBP';
  if (eurozone.has(code)) return 'EUR';
  
  // Everything else → USD
  return 'USD';
};