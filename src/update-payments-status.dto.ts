import { IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { PaymentStatus } from './payment.service';

export class UpdatePaymentsStatusDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  paymentIds: string[];

  @IsNotEmpty()
  @IsIn([PaymentStatus.processed, PaymentStatus.unlocked])
  newStatus: PaymentStatus.processed | PaymentStatus.unlocked;
}
