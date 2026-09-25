import { TransactionStatus, TransactionType } from "../constant/finance.constant";



export interface FinancialTransaction {
  id: string;
  bookingId?: string;
  paymentId?: string;
  userId?: string;
  trainerId: string;
  grossAmount: number;
  trainerAmount: number;
  platformAmount: number;
  trainerPercentage: number;  
  platformPercentage: number; 
  currency: string; // e.g. "INR"
  transactionType: TransactionType;
  status: TransactionStatus;
  referenceKey: string;
  relatedTransactionId?: string;
  note?: string;
  serviceName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CreateFinancialTransactionInput {
  bookingId?: string;
  paymentId?: string;
  userId?: string;
  trainerId: string;
  grossAmount: number;
  trainerAmount: number;
  platformAmount: number;
  trainerPercentage: number;
  platformPercentage: number;
  currency: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  referenceKey: string;
  relatedTransactionId?: string;
  note?: string;
  serviceName?: string;
}
