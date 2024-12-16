import { Injectable } from '@nestjs/common';

@Injectable()
export class MaximizePayoutService {
  // The simplest strategy - almost fastest
  maximizePayout(
    capacity: number,
    payments: { id: string; availablePayOutAmount: number }[],
  ) {
    // Step 1: Sort payments by amount (desc) and ID (asc)
    payments.sort((a, b) => {
      if (b.availablePayOutAmount !== a.availablePayOutAmount) {
        return b.availablePayOutAmount - a.availablePayOutAmount;
      }
      return a.id.localeCompare(b.id);
    });

    // Step 2: Greedily select payments
    const selectedPayments = [];
    let totalPayout = 0;

    for (const payment of payments) {
      if (totalPayout + payment.availablePayOutAmount <= capacity) {
        selectedPayments.push(payment);
        totalPayout += payment.availablePayOutAmount;
      }
    }

    return { totalPayout, selectedPayments };
  }
}
