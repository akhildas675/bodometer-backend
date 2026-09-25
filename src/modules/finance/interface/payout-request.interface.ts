import { PayoutStatus } from "../constant/finance.constant";


export interface PayoutRequest {
  id: string;

  trainerId: string;
  amount: number;
  reservedAmount: number;
  currency: string;
  status: PayoutStatus;
  providerPayoutId?: string;
  rejectionReason?: string;
  failureReason?: string;
  requestedAt: Date;    
  approvedAt?: Date;    
  processedAt?: Date;   
  completedAt?: Date;   
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CreatePayoutRequestInput {
  trainerId: string;
  amount: number;
  reservedAmount: number;
  currency: string;
  status: PayoutStatus;
  requestedAt: Date;
}



export interface UpdatePayoutStatusInput {
  status: PayoutStatus;
  providerPayoutId?: string;
  rejectionReason?: string;
  failureReason?: string;
  approvedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
}
