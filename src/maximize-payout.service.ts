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

  maximizePayoutDP(
    capacity: number,
    payments: { id: string; availablePayOutAmount: number }[],
  ) {
    const n = payments.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j <= capacity; j++) {
        const currentPayment = payments[i - 1].availablePayOutAmount;
        if (currentPayment <= j) {
          dp[i][j] = Math.max(
            dp[i - 1][j], // Exclude current payment
            dp[i - 1][j - currentPayment] + currentPayment, // Include current payment
          );
        } else {
          dp[i][j] = dp[i - 1][j]; // Exclude current payment
        }
      }
    }

    // Backtrack to find selected payments
    const selectedPayments = [];
    let remainingCapacity = capacity;
    for (let i = n; i > 0; i--) {
      if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
        selectedPayments.push(payments[i - 1]);
        remainingCapacity -= payments[i - 1].availablePayOutAmount;
      }
    }

    return {
      totalPayout: dp[n][capacity],
      selectedPayments,
    };
  }
}
