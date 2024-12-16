import { IsNotEmpty, IsNumberString } from "class-validator";

export class SystemFeesDto {
  @IsNotEmpty()
  @IsNumberString()
  fixedA: string; // Fixed amount (A)

  @IsNotEmpty()
  @IsNumberString()
  percentB: string; // Percentage fee (B)

  @IsNotEmpty()
  @IsNumberString()
  percentBlockD: string; // Temporary block percentage (D)
}
