import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  shopId: string;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;
}
