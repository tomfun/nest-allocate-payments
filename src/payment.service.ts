import { Injectable } from '@nestjs/common';
import Big from 'big.js';
import { AdminConfigService } from './admin-config.service';
import { ShopService } from './shop.service';
import { MaximizePayoutService } from './maximize-payout.service';

export enum PaymentStatus {
  new = 'new',
  processed = 'processed',
  unlocked = 'unlocked',
  paidOut = 'paid_out',
}

export interface Payment {
  id: string; // Unique identifier for the payment
  shopId: string; // ID of the shop
  amount: string;
  status: PaymentStatus;
  amountPaidOut: string;
}

export class PaymentError extends Error {}

const currencyPrecision = 2;

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];
  private idCounter = 1;

  constructor(
    private readonly configService: AdminConfigService,
    private readonly shopService: ShopService,
    private readonly maximizePayoutService: MaximizePayoutService,
  ) {}

  createPayment(shopId: string, amount: string): Payment {
    // Check if shop exists
    const shop = this.shopService.getShop(shopId);
    if (!shop) {
      throw new PaymentError(`Shop with ID ${shopId} does not exist`);
    }
    if (+amount <= 0) {
      throw new PaymentError(`Amount must be a positive`);
    }

    // Create payment
    const payment: Payment = {
      id: this.idCounter.toString(),
      shopId,
      amount,
      status: PaymentStatus.new,
      amountPaidOut: '0',
    };
    this.payments.push(payment);
    this.idCounter++;
    return payment;
  }

  updatePaymentStatus(
    paymentIds: string[],
    newStatus: PaymentStatus.processed | PaymentStatus.unlocked,
  ): void {
    // dev comment:
    // use orm, transactions if needed, add actual payout logic
    paymentIds.forEach((id) => {
      const payment = this.payments.find((p) => p.id === id);
      if (!payment) {
        throw new PaymentError(`Payment with ID ${id} not found`);
      }

      // Ensure status transition is valid
      if (
        payment.status === PaymentStatus.new &&
        newStatus === PaymentStatus.processed
      ) {
        payment.status = newStatus;
      } else if (
        payment.status === PaymentStatus.processed &&
        newStatus === PaymentStatus.unlocked
      ) {
        payment.status = newStatus;
      } else {
        throw new PaymentError(
          `Invalid status transition for payment ID ${id}`,
        );
      }
      if (payment.status === PaymentStatus.unlocked) {
        const { availablePayOutAmount, toPayOutAmount } =
          this.calculatePayment(payment);
        if (
          availablePayOutAmount.eq(payment.amountPaidOut) &&
          availablePayOutAmount.eq(toPayOutAmount)
        ) {
          payment.status = PaymentStatus.paidOut;
        }
      }
    });
  }

  payoutPayments(shopId: string): Payment[] {
    const shopPayments = this.getPayments(shopId).filter(
      (p) =>
        p.status !== PaymentStatus.new && p.status !== PaymentStatus.paidOut,
    );
    const wrapperPayments = [] as {
      id: string;
      availablePayOutAmount: Big;
      toPayOutAmount: Big;
    }[];
    let sumToPayOutAmount = Big(0);
    let maxToPayOutAmount = Big(0);
    shopPayments.forEach((payment) => {
      const wrapped = this.calculatePayment(payment);
      if (wrapped.availablePayOutAmount.lte(payment.amountPaidOut)) {
        return;
      }
      sumToPayOutAmount = sumToPayOutAmount.add(wrapped.availablePayOutAmount);
      if (maxToPayOutAmount.lt(wrapped.availablePayOutAmount)) {
        maxToPayOutAmount = wrapped.toPayOutAmount;
      }
      wrapperPayments.push(wrapped);
    });
    const subset = this.maximizePayoutService.maximizePayout(
      sumToPayOutAmount.round(currencyPrecision).toNumber(),
      wrapperPayments.map((wp) => ({
        id: wp.id,
        availablePayOutAmount: wp.toPayOutAmount // allow pay out locked (processed) payments
          .round(currencyPrecision)
          .toNumber(),
      })),
    );
    // todo: make precision safe sum
    return subset.selectedPayments.map((sp) => {
      const payment = this.payments.find((p) => p.id === sp.id);
      payment.amountPaidOut = sp.availablePayOutAmount.toString();
      if (payment.status === PaymentStatus.unlocked) {
        payment.status = PaymentStatus.paidOut;
      }
      return payment;
    });
  }

  getPayments(shopId: string): Payment[] {
    return this.payments.filter((p) => p.shopId === shopId);
  }

  getPayment(paymentId: string): Payment | null {
    return this.payments.find((p) => p.id === paymentId) || null;
  }

  private calculatePayment(payment: Payment): {
    id: string;
    toPayOutAmount: Big;
    availablePayOutAmount: Big;
  } {
    const fees = this.configService.getFees();
    const { commissionC } = this.shopService.getShop(payment.shopId);
    const amount = Big(payment.amount);
    const feeA = Big(fees.fixedA).round(currencyPrecision);
    const feeB = Big(fees.percentB)
      .times(amount)
      .div(100)
      .round(currencyPrecision);
    const feeC = Big(commissionC)
      .times(amount)
      .div(100)
      .round(currencyPrecision);
    const toPayOutAmount = amount.minus(feeA).minus(feeB).minus(feeC);
    const feeD = Big(fees.percentBlockD)
      .times(amount)
      .div(100)
      .round(currencyPrecision);
    const availablePayOutAmount =
      payment.status === PaymentStatus.unlocked
        ? toPayOutAmount
        : toPayOutAmount.minus(feeD);
    return {
      id: payment.id,
      toPayOutAmount,
      availablePayOutAmount,
    };
  }
}
