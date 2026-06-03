export interface Product {
  id: string;
  name: string;
  description: string;
  base64Image: string;
  departmentCode: string; // The ID of the Colombia department
  ownerId: string;
  createdAt: number;
  prices: Record<string, number>;
  category?: string; // Optional category id/name
  additionalImages?: string[];
  basePrice?: number; // Optional base price in Euros
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: number;
}

export interface CountryPricingConfig {
  code: string;
  name: string;
  multiplier: number;
  surcharge: number;
}



