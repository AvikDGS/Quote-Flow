
export interface QuotationItem {
  id: string;
  description: string;
  serviceDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  includes?: string[];
  excludes?: string[];
  billingCycle?: 'fixed' | 'hourly' | 'monthly';
}

export interface QuotationData {
  senderName: string;
  senderAddress: string;
  senderEmail: string;
  senderPhone: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone?: string;
  clientWhatsapp?: string;
  clientWebsite?: string;
  quoteNumber: string;
  date: string;
  expiryDate: string;
  items: QuotationItem[];
  notes: string;
  taxRate: number;
  discount: number;
  logoUrl?: string;
  clientBudget?: number;
  preferredContactMode?: string;
  currency: string;
}

export type ExportFormat = 'pdf' | 'excel' | 'image';
