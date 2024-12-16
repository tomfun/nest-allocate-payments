import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class AddShopDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Shop name

  @IsNotEmpty()
  @IsNumberString()
  commissionC: string; // Commission (C)
}
