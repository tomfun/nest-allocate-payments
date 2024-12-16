import {
  Body,
  Controller,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentError, PaymentService } from './payment.service';
import { UpdatePaymentsStatusDto } from './update-payments-status.dto';
import { CreatePaymentDto } from './create-payment.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':paymentId')
  getPayment(@Param('paymentId') paymentId: string) {
    const payment = this.paymentService.getPayment(paymentId);
    if (!payment) {
      throw new NotFoundException();
    }
    return payment;
  }

  @Post()
  createPayment(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    payload: CreatePaymentDto,
  ): string {
    const { shopId, amount } = payload;
    try {
      return this.paymentService.createPayment(shopId, amount).id;
    } catch (e) {
      if (e instanceof PaymentError) {
        throw new BadRequestException(e.message);
      }
    }
  }

  @Patch('/status')
  updatePaymentStatus(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    payload: UpdatePaymentsStatusDto,
  ): string {
    const { paymentIds, newStatus } = payload;
    try {
      this.paymentService.updatePaymentStatus(paymentIds, newStatus);
    } catch (e) {
      if (e instanceof PaymentError) {
        throw new BadRequestException(e.message);
      }
    }
    return `Payments with IDs ${paymentIds.join(', ')} updated to status ${newStatus}`;
  }
}
