import { Injectable } from "@nestjs/common";
import { SystemFeesDto } from "./system-fees.dto";

@Injectable()
export class AdminConfigService {
  private fees: SystemFeesDto = {
    fixedA: '0',
    percentB: '0',
    percentBlockD: '0',
  };

  setFees(fees: SystemFeesDto): this {
    this.fees = fees;
    return this;
  }

  getFees(): SystemFeesDto {
    return this.fees;
  }
}
