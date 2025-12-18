// Price tier mapping utility
export const PRICE_TIERS = {
  1: { name: 'Standard', price: 75 },
  2: { name: 'Premium', price: 125 },
  3: { name: 'VIP', price: 250 },
} as const;

export type PriceTierInfo = typeof PRICE_TIERS[keyof typeof PRICE_TIERS];

export const getPriceTier = (tierNumber: number): PriceTierInfo => {
  return PRICE_TIERS[tierNumber as keyof typeof PRICE_TIERS] || PRICE_TIERS[1];
};
